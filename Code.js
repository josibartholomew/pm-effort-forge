// PM Effort Calculator prototype: serves index.html and stores data in the Sheet.
// Tabs: Activities (catalog), Settings (key/value), Projects (one row per saved project).
// The defaults live in index.html; it seeds these tabs on first run.

const ACTIVITY_HEADERS = ['id', 'name', 'hours', 'unit', 'timesPerYear', 'tasks', 'description'];
const PROJECT_HEADERS = ['Saved', 'Project', 'Budget', 'Subawards', 'Activities',
  'Base hrs/yr', 'Multiplier', 'Total hrs/yr', 'FTE %', 'Student hrs/wk', 'Risk score', 'Risk level'];

function onOpen() {
  SpreadsheetApp.getUi().createMenu('PM Effort')
    .addItem('Open calculator', 'showCalculator')
    .addToUi();
}

function showCalculator() {
  const html = HtmlService.createHtmlOutputFromFile('index').setWidth(950).setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'PM Effort Calculator');
}

// Also usable as a web app (Deploy > New deployment > Web app).
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index').setTitle('PM Effort Calculator');
}

// Bound script: the Sheet it's attached to. Standalone: set script property SPREADSHEET_ID.
function getSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('No spreadsheet: bind this script to a Sheet or set the SPREADSHEET_ID script property.');
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
      id: String(r[0] || 'row' + (i + 2)), // rows added by hand may have no id
      name: String(r[1]),
      hours: Number(r[2]) || 0,
      unit: String(r[3] || 'year').toLowerCase(),
      timesPerYear: r[4],
      tasks: String(r[5] ?? ''),
      description: String(r[6] ?? '')
    }));

  const settings = {};
  setSheet.getDataRange().getValues().slice(1)
    .filter(r => r[0] !== '')
    .forEach(r => { settings[r[0]] = r[1]; });

  return { activities, settings };
}

function saveConfig(config) {
  const ss = getSpreadsheet_();

  const actSheet = ss.getSheetByName('Activities') || ss.insertSheet('Activities');
  actSheet.clearContents();
  const actRows = [ACTIVITY_HEADERS].concat(config.activities.map(a => ACTIVITY_HEADERS.map(h => a[h] ?? '')));
  actSheet.getRange(1, 1, actRows.length, ACTIVITY_HEADERS.length).setValues(actRows);
  actSheet.setFrozenRows(1);

  const setSheet = ss.getSheetByName('Settings') || ss.insertSheet('Settings');
  setSheet.clearContents();
  const setRows = [['key', 'value']].concat(Object.keys(config.settings).map(k => [k, String(config.settings[k])]));
  // Plain text so "100000 500000 ..." isn't reinterpreted by Sheets.
  setSheet.getRange(1, 2, setRows.length, 1).setNumberFormat('@');
  setSheet.getRange(1, 1, setRows.length, 2).setValues(setRows);
  setSheet.setFrozenRows(1);
}

function saveProject(p) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName('Projects');
  if (!sheet) {
    sheet = ss.insertSheet('Projects');
    sheet.appendRow(PROJECT_HEADERS);
    sheet.setFrozenRows(1);
  }
  const r = p.results;
  sheet.appendRow([new Date(), p.name, p.budget, p.subawards, p.selectedNames.join(', '),
    r.baseHours, r.multiplier, r.totalHours, r.ftePercent / 100, r.studentHoursPerWeek,
    r.riskScore + ' / ' + r.riskMax, r.riskLevel]);
  sheet.getRange(sheet.getLastRow(), 9).setNumberFormat('0.0%');
}
