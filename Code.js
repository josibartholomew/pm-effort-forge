// PM Effort Calculator: Serves index.html and synchronizes project data with Google Sheets.
// Tabs created/managed: 'Activities' (catalog), 'Settings' (key/value), 'Projects' (saved projects log).

const ACTIVITY_HEADERS = ['id', 'name', 'description', 'hours', 'unit', 'timesPerYear'];
const PROJECT_HEADERS = [
  'Saved', 'Project', 'Budget', 'Subawards', 'Activities',
  'Base hrs/yr', 'Multiplier', 'Total hrs/yr', 'FTE %', 'Student hrs/wk'
];

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

// Also usable as a web app (Deploy > New deployment > Web app).
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('PM Effort Calculator')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Bound script: the Sheet it's attached to. Standalone: set script property SPREADSHEET_ID.
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
  if (!actSheet || !setSheet) return null; // index.html will seed defaults

  const activities = actSheet.getDataRange().getValues().slice(1)
    .filter(r => r[1] !== '')
    .map((r, i) => ({
      id: String(r[0] || 'row' + (i + 2)),
      name: String(r[1]),
      description: String(r[2] || ''),
      hours: Number(r[3]) || 0,
      unit: String(r[4] || 'year').toLowerCase(),
      timesPerYear: r[5]
    }));

  const settings = {};
  setSheet.getDataRange().getValues().slice(1)
    .filter(r => r[0] !== '')
    .forEach(r => { settings[r[0]] = r[1]; });

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
    sheet.getRange(1, 1, 1, PROJECT_HEADERS.length).setFontWeight('bold').setBackground('#DB0000').setFontColor('#FFFFFF');
  }
  const r = p.results;
  sheet.appendRow([
    new Date(), p.name, p.budget, p.subawards, p.selectedNames.join(', '),
    r.baseHours, r.multiplier, r.totalHours, r.ftePercent / 100, r.studentHoursPerWeek
  ]);

  // Format row cells for clean visual display in Google Sheets
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  sheet.getRange(lastRow, 3).setNumberFormat('$#,##0');
  sheet.getRange(lastRow, 6, 1, 3).setNumberFormat('0.0');
  sheet.getRange(lastRow, 9).setNumberFormat('0.0%');
  sheet.getRange(lastRow, 10).setNumberFormat('0.0');
}

function getSavedProjects() {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Projects');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  return data.slice(1).map((r, i) => ({
    id: i,
    savedAt: r[0] instanceof Date ? r[0].toLocaleString() : String(r[0]),
    name: String(r[1] || 'Untitled'),
    budget: Number(r[2]) || 0,
    subawards: Number(r[3]) || 0,
    activitiesText: String(r[4] || ''),
    baseHours: Number(r[5]) || 0,
    multiplier: Number(r[6]) || 1,
    totalHours: Number(r[7]) || 0,
    ftePercent: (Number(r[8]) || 0) * 100,
    studentHoursPerWeek: Number(r[9]) || 0
  })).reverse(); // Return latest saved projects first
}