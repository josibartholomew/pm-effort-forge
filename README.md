# PM Effort Calculator

A tool for estimating how much project management time a sponsored project (such as a grant) will need.

You tell the calculator:

- which project management tasks the project needs (for example, budget monitoring or quarterly reports),
- the project's annual budget, and
- how many subawards (partner organizations) it has.

It then estimates:

- **Total hours per year** spent on project management
- **FTE %**: how much of one full-time position that is (100% = one person working full time)
- **Student hours per week**: how many hours a week a student worker would need to cover the work
- **Projected cost**: a yearly cost range for that share of a full-time position

---

## Contents

1. [Two ways to use it](#two-ways-to-use-it)
2. [Using the calculator](#using-the-calculator)
3. [Saved projects](#saved-projects)
4. [Admin & Settings](#admin--settings)
5. [How the estimate is calculated](#how-the-estimate-is-calculated)
6. [Setting it up with Google Sheets](#setting-it-up-with-google-sheets)
7. [Setting it up as a web page (no Google account needed)](#setting-it-up-as-a-web-page-no-google-account-needed)
8. [Using a CSV file for the activity list](#using-a-csv-file-for-the-activity-list)
9. [Making it your own](#making-it-your-own)
10. [Reference](#reference)

---

## Two ways to use it

The calculator can run in two ways. It works out which one it's in automatically.

| | **Google Sheets version** (recommended) | **Web page version** |
|---|---|---|
| Where it runs | Inside a Google Sheet, or as a link shared with your Google Workspace | Any web browser, from a file or a website like GitHub Pages |
| Where saved projects go | A `Projects` tab in the Google Sheet, which everyone shares | Only the browser you saved them in |
| Admin & Settings tab | Available (password protected) | **Not available**. Use a [CSV file](#using-a-csv-file-for-the-activity-list) to change activities and settings instead |
| Good for | A team sharing one set of activities and project records | Trying it out, or one person on one computer |

---

## Using the calculator

The **Effort Calculator** tab is where you build an estimate.

1. **Enter the project details**: project name, annual budget, and number of subawards.
2. **Check the activities the project needs.** Default activities (Project launch, Project closeout, and Budget monitoring to start) are listed first and already checked. Use **Select All** or **Select None** to speed this up.
3. **Read the results.** The totals update as you go. Hover over the ⓘ icons for an explanation of each number.
4. Click **Save Project** to keep it, or **🖨️ Print / Export PDF Summary** to print it or save it as a PDF.

**Reset Calculator** clears everything so you can start a new project.

### Adjusting activities for just one project

Sometimes a project needs more or less time on a task than usual. Turn on **Customize activities for this project** to:

- **Change an activity's hours or how often it happens.** Changed activities are labeled **Adjusted**. Click **Reset to catalog** to undo.
- **Set all selected to … hrs per …** to give every checked activity the same amount of time (for example, 1 hour per week).
- **+ Add activity to this project** to add a task that only this project needs. It's labeled **Added**.

These changes only affect the current project. They don't change the shared activity list. Activities you didn't change keep up with any future updates an admin makes.

### Don't lose your work

- If you have changes you haven't saved, you'll see **Unsaved changes** next to the Save button and a **•** on the calculator tab.
- The calculator asks before doing anything that would throw away unsaved changes, and your browser warns you if you try to close the page.
- If the page is closed anyway, your work is kept in the browser. The next time you open the calculator, it offers to **Restore** or **Discard** those changes.

---

## Saved projects

The **Saved Projects** tab lists every project that's been saved.

- **Search** by project name, date saved, or activity.
- **Load** opens a project in the calculator so you can review or change it.
- **Delete** removes it (you'll be asked to confirm).

Every project needs a different name. If you load a project, change it, and save, the existing record is updated (even if you rename it). Saving a *new* project with a name that's already taken is blocked, and you'll be asked to pick another name.

---

## Admin & Settings

The **Admin & Settings** tab controls the shared list of activities and the numbers used in the calculation. It's protected by a password.

> ⚠️ **Change the password before sharing the calculator.** The starting password is `admin123`. See [step 3 of setup](#3-change-the-admin-password).

From this tab you can:

- **Edit the activity list**: names, descriptions, hours, and how often each happens. Check **Default** to list an activity first and check it automatically on a new calculator. **+ Add Activity** adds a new one, and **Delete** removes one.
- **Change the settings** described in [How the estimate is calculated](#settings-you-can-change).
- **Save Admin Changes** to apply your edits for everyone.
- **Reset to Defaults** to go back to the original activity list and settings.
- **Export Config (JSON)** to download a backup of the activity list and settings, and **Import Config** to load one back in.

> Saving admin changes **replaces** the `Activities` and `Settings` tabs in the Google Sheet. Don't add your own notes or extra columns to those two tabs, because they'll be erased.

The Admin tab only works in the Google Sheets version, because the password is checked by Google. In the web page version, use a [CSV file](#using-a-csv-file-for-the-activity-list) instead.

---

## How the estimate is calculated

### Step 1: Hours per year for each activity

Each activity has a number of hours and how often it happens:

| How often | Hours per year | Example |
|---|---|---|
| Per week | hours × 52 | 2.5 hrs/week → 130 hrs/year |
| Per month | hours × 12 | 5.5 hrs/month → 66 hrs/year |
| Per year | hours | 20 hrs/year → 20 hrs/year |
| Each (a set number of times a year) | hours × times per year | 6 hrs, 4 times a year → 24 hrs/year |

**Base hours** are the hours per year of all the checked activities added together.

### Step 2: Complexity multiplier

Bigger projects and more partners mean more coordination, so the base hours are increased:

- Start at **1**
- Add **0.05** for each subaward
- Add **0.03** for each $100,000 of annual budget
- The multiplier can't go above **2**

### Step 3: Results

- **Total hours per year** = base hours × multiplier
- **FTE %** = total hours ÷ 2,080 (one full-time year) × 100
- **Student hours per week** = total hours ÷ 48 (weeks a student works per year)
- **Projected cost** = FTE × $58,000 to FTE × $64,000 (the full-time salary range)

### Example

A project with a **$500,000** budget, **2 subawards**, and **300 base hours**:

- Multiplier = 1 + (2 × 0.05) + (5 × 0.03) = **1.25**
- Total hours = 300 × 1.25 = **375 hours per year**
- FTE = 375 ÷ 2,080 = **18.0%**
- Student hours = 375 ÷ 48 = **7.8 hours per week**
- Projected cost = 18.0% × $58,000 to 18.0% × $64,000 = **$10,457 to $11,538 per year**

### Settings you can change

All of these can be changed on the Admin & Settings tab. The multiplier numbers are starting points. Adjust them to fit your institution.

| Setting | Starting value | What it means |
|---|---|---|
| `pmWeeksPerYear` | 52 | Weeks per year used for weekly activities |
| `studentWeeksPerYear` | 48 | Weeks per year a student worker works |
| `fullTimeHours` | 2080 | Hours in one full-time year (100% FTE) |
| `subawardRate` | 0.05 | Amount added to the multiplier for each subaward |
| `budgetRatePer100k` | 0.03 | Amount added to the multiplier for each $100,000 of budget |
| `multiplierCap` | 2 | The highest the multiplier can go |
| `annualSalaryMin` | 58000 | Low end of the full-time yearly salary used for projected cost |
| `annualSalaryMax` | 64000 | High end of the full-time yearly salary used for projected cost |

---

## Setting it up with Google Sheets

You don't need to install anything. These steps use your web browser and a Google account.

### 1. Create the Sheet and add the code

1. Create a new Google Sheet. This is where the activity list and saved projects will be stored.
2. In the Sheet, go to **Extensions → Apps Script**. A code editor opens in a new tab.
3. You'll see a file called `Code.gs`. Delete everything in it, then copy in the entire contents of [`Code.js`](Code.js) from this project.
4. Click the **+** next to **Files**, choose **HTML**, and name it `index` (exactly, in lowercase). Delete what's in it and copy in the entire contents of [`index.html`](index.html).
5. Click the 💾 **Save** icon.

### 2. Open the calculator

1. Go back to your Sheet and reload the page.
2. A new **PM Effort** menu appears. Choose **PM Effort → Open calculator**.
3. The first time, Google asks you to approve access to the Sheet. Click through and allow it.

The calculator starts with a built-in list of activities. To store that list in the Sheet so you can edit it there, log in to Admin & Settings and click **Save Admin Changes**. The `Projects` tab is created automatically the first time someone saves a project.

### 3. Change the admin password

1. In the Apps Script editor, open `Code.gs`.
2. Near the top, find this line:

   ```js
   const ADMIN_PASSWORD = 'admin123';
   ```

3. Replace `admin123` with your own password. Keep the quote marks around it.
4. Click 💾 **Save**.

Anyone who can edit the Apps Script code can see this password, so only give edit access to people you trust.

### 4. (Optional) Share it as a link

To let people use the calculator without opening the Sheet:

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the ⚙️ gear next to **Select type** and choose **Web app**.
3. Click **Deploy**, then copy the **Web app URL** and share it.

By default only people in your organization's Google Workspace can open the link, and the calculator saves to the Sheet using your account.

<details>
<summary><strong>For developers: pushing the code with clasp</strong></summary>

If you'd rather manage the code from the command line, the repo is set up for [clasp](https://github.com/google/clasp):

```bash
npm install -g @google/clasp
clasp login
clasp push
```

- `.clasp.json` points at the original Apps Script project. Replace its `scriptId` with your own, or delete it and run `clasp create --type sheets`.
- `.claspignore` makes sure only `Code.js`, `index.html`, and `appsscript.json` get pushed.
- `appsscript.json` sets the time zone (`America/Denver`) and the web app's access. Web app access is limited to your domain and runs as the person who deployed it.
- Never commit `.clasprc.json`, which holds your login. It's already listed in `.gitignore`.

If the script isn't attached to a Sheet, add a **Script Property** named `SPREADSHEET_ID` with the Sheet's ID (under **Project Settings → Script Properties**).

</details>

---

## Setting it up as a web page (no Google account needed)

`index.html` works on its own:

- **On your computer**: download `index.html` and double-click it to open it in your browser.
- **On GitHub Pages**: in this repository on GitHub, go to **Settings → Pages**, pick the branch to publish, choose the `/ (root)` folder, and save. After a minute or two, the calculator is available at `https://<your-username>.github.io/pm-effort-forge/`.

Keep in mind:

- Everything is saved **only in the browser you're using**. Other people, other computers, and even other browsers on the same computer won't see your projects.
- Clearing your browser's history or site data erases your saved projects.
- The Admin & Settings tab can't be unlocked in this version. To change the activity list or settings, use a CSV file (below).

---

## Using a CSV file for the activity list

A CSV is a simple spreadsheet file. You can create or edit one in Excel or Google Sheets (use **File → Download → .csv** to save it).

Click **Input** at the top of the calculator to choose where the activity list and settings come from:

- **Connected Google Sheet**: uses the `Activities` and `Settings` tabs (Google Sheets version only).
- **Uploaded CSV**: uses a file you upload. It's stored in your browser only.

**The easiest way to make a CSV:** click **Input → Download CSV** to get the current list, edit it in a spreadsheet program, then use **Upload CSV** to load it back in.

Even when you use a CSV, saved projects still go to the Sheet's `Projects` tab if a Sheet is connected.

### What goes in the file

Each row is either an **activity** or a **setting**:

| type | id | name | description | hours | unit | timesPerYear | default | value |
|---|---|---|---|---|---|---|---|---|
| activity | launch | Project launch | Establishes startup tracking tools... | 8 | year | | yes | |
| activity | quarterly_report | Quarterly progress report | Drafts quarterly reports... | 6 | each | 4 | no | |
| setting | fullTimeHours | | | | | | | 2080 |

Rules:

- **unit** must be `week`, `month`, `year`, or `each`. If it's `each`, fill in **timesPerYear**.
- **id** is a short code for each activity. Each activity needs a different one.
- **default** is `yes` for activities that should be listed first and checked automatically. Leave it blank or `no` otherwise.
- For setting rows, put the setting's name in **id** and its number in **value**. The setting name must be one of the ones in the [settings table](#settings-you-can-change). Settings you leave out keep their current values.
- If the file has no **type** column, every row is treated as an activity.

If something in the file isn't right, the calculator tells you which row has the problem.

---

## Making it your own

To adapt the calculator for another institution, make a copy of this project (on GitHub, click **Fork**), then:

1. **Set your own activities and settings.** The easiest way is to set them up in the calculator and upload a CSV or use **Import Config**. To change the built-in starting list, edit the section of `index.html` that begins with `const DEFAULT_CONFIG`.
2. **Change the logo.** In `index.html`, find the `<img src="...">` line near the top of the page content (it currently shows the Southern Utah University logo) and replace the web address with your own logo's.
3. **Change the colors.** Near the top of `index.html`, change the values of `--primary-red` and `--dark-red` to your own colors.
4. **Change the admin password** (see [above](#3-change-the-admin-password)).
5. Follow the setup steps for Google Sheets or for the web page version.

---

## Reference

### Files in this project

| File | What it is |
|---|---|
| `index.html` | The calculator itself: everything you see and click |
| `Code.js` | The Google Sheets connection: adds the menu, checks the admin password, and reads and writes the Sheet |
| `appsscript.json` | Google Apps Script settings (time zone, who can open the web app link) |
| `.clasp.json`, `.claspignore` | Settings for the optional clasp developer tool |
| `.gitignore` | Tells Git which files never to save to the repository, such as login credentials |

### Google Sheet tabs

| Tab | Columns |
|---|---|
| `Activities` | `id`, `name`, `description`, `hours`, `unit`, `timesPerYear` |
| `Settings` | `key`, `value` |
| `Projects` | `Saved`, `Project`, `Budget`, `Subawards`, `Activities`, `Base hrs/yr`, `Multiplier`, `Total hrs/yr`, `FTE %`, `Student hrs/wk`, `Customizations` |

The `Customizations` column stores a project's activity adjustments in a format the calculator reads back when you load the project. Don't edit it by hand. If your `Projects` tab was created before this column existed, it's added automatically the next time a project is saved.
