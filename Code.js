// PM Effort Calculator: Serves index.html and synchronizes project data with Google Sheets.

// Hardcoded Admin Password (change 'admin123' to your preferred password)
const ADMIN_PASSWORD = 'admin123';

const ACTIVITY_HEADERS = ['id', 'name', 'description', 'hours', 'unit', 'timesPerYear'];
const PROJECT_HEADERS = [
  'Saved', 'Project', 'Budget', 'Subawards', 'Activities',
  'Base hrs/yr', 'Multiplier', 'Total hrs/yr', 'FTE %', 'Student hrs/wk', 'Customizations'
];
const CUSTOMIZATIONS_COL = PROJECT_HEADERS.indexOf('Customizations');

/**
 * Server-side password verification (runs strictly on Google servers)
 */
function verifyAdminPassword(pwd) {
  return pwd === ADMIN_PASSWORD;
}

function parseNum_(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).replace(/[$,%\s]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function nameKey_(name) {
  return String(name || '').trim().toLowerCase();
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('PM Effort')
    .addItem('Open calculator', 'showCalculator')
    .addToUi();
}

function showCalculator() {
  const html = HtmlService.createHtmlOutputFromFile('index')
    .setWidth(1000)
    .setHeight(750);
  SpreadsheetApp.getUi().showModalDialog(html, 'PM Effort Calculator');
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('PM Effort Calculator')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('No spreadsheet found. Bind this script to a Sheet or set SPREADSHEET_ID script property.');
  return SpreadsheetApp.openById(id);
}

function getConfig() {
  const ss = getSpreadsheet_();
  const actSheet = ss.getSheetByName('Activities');
  const setSheet = ss.getSheetByName('Settings');
  if (!actSheet || !setSheet) return null;

  const activities = actSheet.getDataRange().getValues().slice(1)
    .filter(r => r[1] !== '')
    .map((r, i) => ({
      id: String(r[0] || 'row' + (i + 2)),
      name: String(r[1]),
      description: String(r[2] || ''),
      hours: parseNum_(r[3]),
      unit: String(r[4] || 'year').toLowerCase(),
      timesPerYear: (r[5] !== '' && r[5] !== undefined) ? parseNum_(r[5]) : ''
    }));

  const settings = {};
  setSheet.getDataRange().getValues().slice(1)
    .filter(r => r[0] !== '')
    .forEach(r => { settings[r[0]] = parseNum_(r[1]); });

  return { activities, settings };
}

function saveConfig(config) {
  const ss = getSpreadsheet_();

  let actSheet = ss.getSheetByName('Activities') || ss.insertSheet('Activities');
  actSheet.clearContents();
  const actRows = [ACTIVITY_HEADERS].concat(config.activities.map(a => ACTIVITY_HEADERS.map(h => a[h] ?? '')));
  actSheet.getRange(1, 1, actRows.length, ACTIVITY_HEADERS.length).setValues(actRows);
  actSheet.setFrozenRows(1);
  actSheet.getRange(1, 1, 1, ACTIVITY_HEADERS.length).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');

  let setSheet = ss.getSheetByName('Settings') || ss.insertSheet('Settings');
  setSheet.clearContents();
  const setRows = [['key', 'value']].concat(Object.keys(config.settings).map(k => [k, String(config.settings[k])]));
  setSheet.getRange(1, 1, setRows.length, 2).setValues(setRows);
  setSheet.setFrozenRows(1);
  setSheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#000000').setFontColor('#FFFFFF');
}

function saveProject(p) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName('Projects');
  if (!sheet) {
    sheet = ss.insertSheet('Projects');
    sheet.appendRow(PROJECT_HEADERS);
    sheet.setFrozenRows(1);
  }
  // Older Projects tabs were created before the Customizations column existed.
  const headerRange = sheet.getRange(1, 1, 1, PROJECT_HEADERS.length);
  if (headerRange.getValues()[0][CUSTOMIZATIONS_COL] !== PROJECT_HEADERS[CUSTOMIZATIONS_COL]) {
    headerRange.setValues([PROJECT_HEADERS]);
  }
  headerRange.setFontWeight('bold').setBackground('#DB0000').setFontColor('#FFFFFF');

  const r = p.results || {};

  let actStr = '';
  if (Array.isArray(p.selectedNames) && p.selectedNames.length > 0) {
    actStr = p.selectedNames.join(', ');
  } else if (Array.isArray(p.activities) && p.activities.length > 0) {
    actStr = p.activities.join(', ');
  } else if (Array.isArray(p.selectedIds) && p.selectedIds.length > 0) {
    actStr = p.selectedIds.join(', ');
  } else if (typeof p.activitiesText === 'string') {
    actStr = p.activitiesText;
  }

  const name = String(p.name || 'Untitled').trim();

  // Resaving the loaded project updates its row; any other project with the same name blocks the save.
  const data = sheet.getDataRange().getValues();
  const original = p.originalName === null || p.originalName === undefined ? null : nameKey_(p.originalName);
  let targetRow = -1;
  if (original !== null) {
    for (let i = data.length - 1; i >= 1; i--) {
      if (nameKey_(data[i][1]) === original) { targetRow = i + 1; break; }
    }
  }
  if (nameKey_(name) !== original && data.slice(1).some(r => nameKey_(r[1]) === nameKey_(name))) {
    throw new Error('A project named "' + name + '" already exists. Choose a different name.');
  }

  const customizations = JSON.stringify({
    selectedIds: Array.isArray(p.selected) ? p.selected : [],
    activityOverrides: p.activityOverrides || {},
    customActivities: Array.isArray(p.customActivities) ? p.customActivities : []
  });
  const budget = parseNum_(p.budget);
  const subawards = parseNum_(p.subawards);
  const baseHours = parseNum_(r.baseHours);
  const multiplier = parseNum_(r.multiplier) || 1;
  const totalHours = parseNum_(r.totalHours);
  const ftePercent = parseNum_(r.ftePercent);
  const fteDecimal = ftePercent > 1 ? ftePercent / 100 : ftePercent;
  const studentHours = parseNum_(r.studentHoursPerWeek);

  const row = [
    new Date(), name, budget, subawards, actStr,
    baseHours, multiplier, totalHours, fteDecimal, studentHours, customizations
  ];
  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
    targetRow = sheet.getLastRow();
  }

  sheet.getRange(targetRow, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  sheet.getRange(targetRow, 3).setNumberFormat('$#,##0');
  sheet.getRange(targetRow, 6, 1, 3).setNumberFormat('0.0');
  sheet.getRange(targetRow, 9).setNumberFormat('0.0%');
  sheet.getRange(targetRow, 10).setNumberFormat('0.0');

  return true;
}

function getSavedProjects() {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Projects');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const nameToIdMap = {};
  const actSheet = ss.getSheetByName('Activities');
  if (actSheet) {
    const actData = actSheet.getDataRange().getValues().slice(1);
    actData.forEach(r => {
      const actId = String(r[0] || '').trim();
      const actName = String(r[1] || '').trim();
      if (actName) {
        if (actId) nameToIdMap[actName.toLowerCase()] = actId;
      }
    });
  }

  // Row 1 is headers. Data starts at Row 2
  const projects = data.slice(1).map((r, i) => {
    const rawActText = String(r[4] || '').trim();

    // Parse comma-separated activity items
    const namesArray = rawActText
      ? rawActText.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const idsArray = namesArray.map(item => {
      const lower = item.toLowerCase();
      return nameToIdMap[lower] || item;
    });

    let custom = null;
    try { custom = r[CUSTOMIZATIONS_COL] ? JSON.parse(r[CUSTOMIZATIONS_COL]) : null; } catch (e) { custom = null; }

    let fte = parseNum_(r[8]);
    if (fte > 0 && fte <= 1) {
      fte = fte * 100;
    }

    return {
      id: i,                          // Original 0-based data index
      rowIndex: i + 2,                // Actual row number in Google Sheet
      savedAt: r[0] instanceof Date ? r[0].toLocaleString() : String(r[0] || ''),
      name: String(r[1] || 'Untitled'),
      budget: parseNum_(r[2]),
      subawards: parseNum_(r[3]),
      activitiesText: rawActText,
      selectedNames: namesArray,      // Array of Activity Names
      activities: namesArray,         // Alias array
      selectedIds: idsArray,          // Array of Activity IDs
      selectedActivities: namesArray, // Alias array
      baseHours: parseNum_(r[5]),
      multiplier: parseNum_(r[6]) || 1,
      totalHours: parseNum_(r[7]),
      ftePercent: fte,
      studentHoursPerWeek: parseNum_(r[9]),
      // Only rows saved with customizations carry exact IDs; older rows fall back to name matching.
      selected: custom && Array.isArray(custom.selectedIds) ? custom.selectedIds : undefined,
      activityOverrides: (custom && custom.activityOverrides) || {},
      customActivities: (custom && custom.customActivities) || []
    };
  });

  return projects.reverse();
}

function deleteSavedProject(id) {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Projects');
  if (!sheet) return false;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const targetId = Number(id);
  if (isNaN(targetId)) return false;

  const projects = getSavedProjects();
  const match = projects.find(p => p.id === targetId || p.rowIndex === targetId);

  let rowToDelete = -1;
  if (match) {
    rowToDelete = match.rowIndex;
  } else {
    const calcRow = targetId + 2;
    if (calcRow >= 2 && calcRow <= lastRow) {
      rowToDelete = calcRow;
    }
  }

  if (rowToDelete >= 2 && rowToDelete <= lastRow) {
    sheet.deleteRow(rowToDelete);
    return true;
  }
  return false;
}