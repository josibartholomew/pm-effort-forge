# PM Effort Forge

A project management effort calculator for sponsored projects. Pick the PM activities a project needs, enter its annual budget and number of subawards, and the calculator estimates:

- **Total annualized hours**: base activity hours times a complexity multiplier
- **FTE %**: total hours as a share of a full-time year
- **Student hours/week**: the weekly hours a student worker would need to cover the effort

Each estimate can be saved to a project log or exported as a formatted PDF report.

**Contents:** [Using the calculator](#using-the-calculator) · [Setup: Google Sheets](#setup-google-sheets-version) · [Setup: Standalone](#setup-standalone--github-pages-version) · [Updating the deployed app](#updating-the-deployed-app) · [How the calculation works](#how-the-calculation-works) · [Admin input](#admin-input-google-sheet-or-csv) · [Customizing](#customizing-for-your-institution)

## Overview

The whole app is one page (`index.html`) that runs in two modes. It detects which mode it's in automatically.

| Mode | Where it runs | Activities & settings | Saved projects | Admin tab |
|------|---------------|-----------------------|----------------|-----------|
| **Google Sheets** | Apps Script dialog or web app | `Activities` / `Settings` tabs (or an uploaded CSV) | `Projects` tab | Password required |
| **Standalone** | Any static host (e.g. GitHub Pages) or opened locally | Browser storage (localStorage) | Browser storage (localStorage) | Open |

No build step, server or database is needed.

### Files

| File | Purpose |
|------|---------|
| `index.html` | The full calculator: UI, calculations, storage, CSV import/export, PDF report |
| `Code.js` | Apps Script backend: Sheet menu, web app entry point, admin password check, reads/writes the Sheet tabs |
| `appsscript.json` | Apps Script manifest (V8 runtime, `America/Denver` time zone) |
| `.clasp.json` / `.claspignore` | Config for pushing the files to Apps Script with [clasp](https://github.com/google/clasp) |

## Using the calculator

The app has three tabs.

**Effort Calculator**
1. Enter the project name, annual budget and number of subawards.
2. Check the activities the project needs. Hours update as you go.
3. Under **Calculated Results**, click **Save Project** to add it to the log, or **Print / Export PDF Summary** to make a report.

The PDF report is a letter-size summary built for sharing. It has headline totals, the project inputs, a table of the selected activities with each one's share of the hours, and the multiplier formula with that project's numbers. Choose **Save as PDF** in the print dialog; the file name defaults to `PM Effort Estimate - <project name>`. Pressing Ctrl/Cmd+P produces the same report.

**Saved Projects**: lists saved estimates. **Load** puts one back into the calculator and **Delete** removes it.

**Admin & Settings**: edit the activity catalog and the calculator settings, then click **Save Admin Changes**. In Google Sheets mode this tab asks for the admin password first (see [Admin password](#admin-password)).

## Setup: Google Sheets version

### 1. Push the code with clasp

```bash
npm install -g @google/clasp
clasp login
clasp push
```

`.clasp.json` points at the existing Apps Script project. To set up your own copy, replace `scriptId` with your own script's ID, or delete `.clasp.json` and run `clasp create --type sheets`.

`.claspignore` makes sure only `Code.js`, `index.html` and `appsscript.json` get pushed.

> [!WARNING]
> Never commit `.clasprc.json` (your clasp OAuth credentials). It's already in `.gitignore`.

### 2. Connect it to a spreadsheet

- **Bound script** (recommended): create the script from the Sheet (**Extensions → Apps Script**) or with `clasp create --type sheets`. It uses that spreadsheet automatically.
- **Standalone script**: in the Apps Script editor go to **Project Settings → Script Properties** and add `SPREADSHEET_ID` with the target spreadsheet's ID.

### 3. Set the admin password

Change `ADMIN_PASSWORD` at the top of `Code.js` before you push. See [Admin password](#admin-password).

### 4. Open the calculator

- **From the Sheet**: reload the spreadsheet and choose **PM Effort → Open calculator**.
- **As a web app**: in the Apps Script editor choose **Deploy → New deployment → Web app**, then share the URL.

The first time it runs, if the `Activities` or `Settings` tab is missing, the calculator loads the built-in defaults. Clicking **Save Admin Changes** writes them to the Sheet. The `Projects` tab is created the first time someone saves a project.

### Sheet tabs

| Tab | Columns |
|-----|---------|
| `Activities` | `id`, `name`, `description`, `hours`, `unit`, `timesPerYear` |
| `Settings` | `key`, `value` |
| `Projects` | `Saved`, `Project`, `Budget`, `Subawards`, `Activities`, `Base hrs/yr`, `Multiplier`, `Total hrs/yr`, `FTE %`, `Student hrs/wk` |

> [!IMPORTANT]
> Saving admin changes **rewrites** the `Activities` and `Settings` tabs completely. Any extra columns or notes you add there will be removed.

### Admin password

In Google Sheets mode the **Admin & Settings** tab is locked until someone enters the password set by `ADMIN_PASSWORD` in `Code.js` (default: `admin123`). The check runs on the Apps Script server.

> [!CAUTION]
> Treat this as a convenience lock, not real security:
> - This repository is public, so a password committed to `Code.js` is visible to anyone. Don't reuse a password you use elsewhere.
> - The lock only hides the admin panel. Anyone who can open the calculator could still save config by calling the backend directly.

Standalone mode has no lock: there's no server to check a password, and each person's changes only affect their own browser.

## Setup: Standalone / GitHub Pages version

`index.html` works on its own:

- **Locally**: open `index.html` in a browser.
- **GitHub Pages**: in the repo go to **Settings → Pages**, set the source to the branch you want and the `/ (root)` folder. The calculator is served at `https://<user>.github.io/pm-effort-forge/`.

In this mode everything stays in the current browser. Use **Export Config (JSON)** or **Download CSV** on the Admin tab to back up or share your activity catalog. (The JSON tools are only shown in standalone mode.)

## Updating the deployed app

After changing the code, run `clasp push` from the repo root. What that updates depends on how people open the calculator:

| Opened from | After `clasp push` |
|-------------|--------------------|
| **PM Effort** menu in the Sheet | Live right away. Reload the spreadsheet. |
| Web app URL | **Not updated yet.** Web app deployments are pinned to a version. Publish one with **Deploy → Manage deployments → Edit → Version: New version**, or `clasp deploy --deploymentId <id>`. |
| GitHub Pages | Updates when the change is merged into the Pages branch. |

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

For example, a $480,000 project with 2 subawards and 600 base hours gets a multiplier of `1 + 2 × 0.05 + 4.8 × 0.03 = 1.244`, so 746.4 total hours, 35.9% FTE and 15.5 student hours/week.

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
2. Replace the branding:
   - The logo URL appears twice in `index.html`: the app header and the PDF report header (in `renderPrintReport`).
   - Colors are the `:root` variables `--primary-red` and `--dark-red`.
   - The PDF page footer text is in the `@page` rule of the print styles.
3. Change `ADMIN_PASSWORD` in `Code.js`.
4. Follow the setup steps above for Google Sheets and/or GitHub Pages.
