# pm-effort-forge

A project management effort calculator for sponsored projects. You pick the PM activities a project needs, enter its budget and number of subawards, and the calculator estimates:

- **Total annualized hours**: the base activity hours times a complexity multiplier
- **FTE %**: total hours as a share of a full-time year
- **Student hours/week**: the weekly hours a student worker would need to cover the effort

The whole app is one page (`index.html`). It runs in two modes:

| Mode | Where it runs | Activities & settings | Saved projects |
|------|---------------|-----------------------|----------------|
| **Google Sheets** | Apps Script dialog or web app | `Activities` / `Settings` tabs (or an uploaded CSV) | `Projects` tab |
| **Standalone** | Any static host (e.g. GitHub Pages) or opened locally | Browser storage (localStorage) | Browser storage (localStorage) |

The page detects which mode it's in automatically. No server or database is needed.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The full calculator: UI, calculations, storage, CSV import/export |
| `Code.js` | Apps Script backend: Sheet menu, web app entry point, reads/writes the Sheet tabs |
| `appsscript.json` | Apps Script manifest (V8 runtime, `America/Denver` time zone) |
| `.clasp.json` / `.claspignore` | Config for pushing the files to Apps Script with [clasp](https://github.com/google/clasp) |

## Setup: Google Sheets version

### 1. Push the code with clasp

```bash
npm install -g @google/clasp
clasp login
clasp push
```

`.clasp.json` points at the existing Apps Script project. To set up your own copy, replace `scriptId` with your own script's ID, or delete `.clasp.json` and run `clasp create --type sheets`.

`.claspignore` makes sure only `Code.js`, `index.html` and `appsscript.json` get pushed.

> Never commit `.clasprc.json` (your clasp OAuth credentials). It's already in `.gitignore`.

### 2. Connect it to a spreadsheet

- **Bound script** (recommended): create the script from the Sheet (**Extensions → Apps Script**) or with `clasp create --type sheets`. It uses that spreadsheet automatically.
- **Standalone script**: in the Apps Script editor go to **Project Settings → Script Properties** and add `SPREADSHEET_ID` with the target spreadsheet's ID.

### 3. Open the calculator

- **From the Sheet**: reload the spreadsheet and choose **PM Effort → Open calculator**.
- **As a web app**: in the Apps Script editor choose **Deploy → New deployment → Web app**, then share the URL.

The first time it runs, if the `Activities` or `Settings` tab is missing, the calculator loads the built-in defaults. Clicking **Save Admin Changes** writes them to the Sheet. The `Projects` tab is created the first time someone saves a project.

### Sheet tabs

| Tab | Columns |
|-----|---------|
| `Activities` | `id`, `name`, `description`, `hours`, `unit`, `timesPerYear` |
| `Settings` | `key`, `value` |
| `Projects` | `Saved`, `Project`, `Budget`, `Subawards`, `Activities`, `Base hrs/yr`, `Multiplier`, `Total hrs/yr`, `FTE %`, `Student hrs/wk`, `Customizations` |

`Customizations` holds the project's activity changes and selected activity IDs as JSON. Projects tabs created before this column existed get it added the next time a project is saved.

Saving admin changes **rewrites** the `Activities` and `Settings` tabs completely. Any extra columns or notes you add there will be removed.

## Setup: Standalone / GitHub Pages version

`index.html` works on its own with no build step:

- **Locally**: open `index.html` in a browser.
- **GitHub Pages**: in the repo go to **Settings → Pages**, set the source to the branch you want and the `/ (root)` folder. The calculator is served at `https://<user>.github.io/pm-effort-forge/`.

In this mode everything stays in the current browser. Use **Export Config (JSON)** or **Download CSV** on the Admin tab to back up or share your activity catalog.

## Project-specific activities

On the **Effort Calculator** tab, turn on **Customize activities for this project** to change activities for the current project only:

- Edit any activity's hours, unit, or times/yr. Changed activities are marked **Adjusted** and can be reset to the catalog values.
- **Set all selected to … hrs per …** applies one value to every selected activity (for example, 1 hr/week).
- **+ Add activity to this project** adds an activity that exists only in this project (marked **Added**).

These changes are saved with the project (in the `Customizations` column, or browser storage in standalone mode) and never change the shared `Activities` tab. Activities you didn't change keep following the catalog, so later admin edits still apply to them.

### Saving and project names

Project names are unique. Saving a project you loaded from **Saved Projects** updates it in place, including when you rename it. Saving a new project, or renaming one, with a name another saved project already uses is blocked with a message asking for a different name. **Reset Calculator** starts a new project.

## How the calculation works

**Annual hours per activity**, based on its `unit`:

| Unit | Annual hours |
|------|--------------|
| `week` | hours × `pmWeeksPerYear` |
| `month` | hours × 12 |
| `year` | hours |
| `each` | hours × `timesPerYear` |

**Base hours** are the annual hours of all selected activities added together.

**Complexity multiplier**:

```
multiplier = min(multiplierCap,
                 1 + subawards × subawardRate + (budget / 100,000) × budgetRatePer100k)
```

**Outputs**:

```
Total hours/yr = base hours × multiplier
FTE %          = total hours / fullTimeHours × 100
Student hrs/wk = total hours / studentWeeksPerYear
```

### Settings

| Key | Default | Meaning |
|-----|---------|---------|
| `pmWeeksPerYear` | 52 | Weeks per year used for weekly activities |
| `studentWeeksPerYear` | 48 | Weeks per year a student worker is active |
| `fullTimeHours` | 2080 | Hours in one full-time year (100% FTE) |
| `subawardRate` | 0.05 | Multiplier added per subaward |
| `budgetRatePer100k` | 0.03 | Multiplier added per $100k of annual budget |
| `multiplierCap` | 2 | Maximum complexity multiplier |

The multiplier rates and the cap are placeholders. Adjust them on the **Admin & Settings** tab to fit your institution.

## Admin input: Google Sheet or CSV

Click **Input** in the header to choose where the activity catalog and settings come from:

- **Connected Google Sheet**: the `Activities` and `Settings` tabs (only when opened from Google Sheets / Apps Script).
- **Uploaded CSV**: stored in this browser only (localStorage). Use **Download CSV** to get the current config as a starting template.

Saved projects still log to the Sheet's `Projects` tab when a Sheet is connected.

### CSV format

One file holds both activities and settings, distinguished by `type`:

```csv
type,id,name,description,hours,unit,timesPerYear,value
activity,reporting,Annual reporting & compliance,Coordinates sponsor reporting...,20,year,,
activity,quarterly_report,Quarterly progress report,Drafts quarterly reports...,6,each,4,
setting,fullTimeHours,,,,,,2080
```

- `unit` is `week`, `month`, `year`, or `each` (`each` requires `timesPerYear`).
- Setting rows use `id` for the setting key and `value` for the number. Settings left out of the file keep their current values.
- If there is no `type` column, every row is treated as an activity.
- Activity `id`s must be unique.

## Customizing for your institution

Fork the repo, then:

1. Edit `DEFAULT_CONFIG` in `index.html` to set your default activities and settings, or load your own catalog with a CSV or JSON file.
2. Replace the logo `<img>` in the header and the color variables in `:root` (`--primary-red`, `--dark-red`) with your own branding.
3. Follow the setup steps above for Google Sheets and/or GitHub Pages.
