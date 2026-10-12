# pm-effort-forge

## Admin input: Google Sheet or CSV

Click **Input** in the header to choose where the activity catalog and settings come from:

- **Connected Google Sheet** – the `Activities` and `Settings` tabs (only when opened from Google Sheets / Apps Script).
- **Uploaded CSV** – stored in this browser only (localStorage). Use **Download CSV** to get the current config as a starting template.

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
- Setting rows use `id` for the setting key and `value` for the number; settings omitted from the file keep their current values.
- If there is no `type` column, every row is treated as an activity.
