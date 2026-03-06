## Setup

```shell
$ nvm use
$ yarn install
$ cp config-template.json config.json
```

Update `config.json` with your particular configuration.

## Usage

### Get a summary report for a month

```shell
$ yarn run-script src/scripts/get-report.ts -d 2026-01
```

### Create worklogs for some interval of days (Saturday and Sunday will be automatically excluded):

With a data range (end data inclusive):

```shell
$ yarn run-script src/scripts/SaveWorklogScript.ts --start-time 09:00 --end-time 13:30 --signature="Arnau Sanchez" --user-legal-id="12345678N" --user-id 6813404 --list-id 901215049998 --date 2026-02-14..2026-02-16 --dry-run
```

With a relative data range (negative/positive days from today). Example to send worklogs for the previous 10 days:

```shell
$ yarn run-script src/scripts/SaveWorklogScript.ts [...] --date -10..0
```

#### How to use Google Calendar as off-days-source

Sat/Sun are never posted, but we also have off days that should not be posted.

Get the Google Calendar ID:

-   Go to "https://calendar.google.com/"
-   Left sidebar, locate the Holidays calendar, 3-dot button -> Settings
-   In section "Integrate Calendar", copy the calendar ID (i.e "c_verylongstring@group.calendar.google.com")

Get the authentication JSON:

-   Go to https://console.cloud.google.com
-   Select an existing project in the selector (or create a new one)
-   Click `+ Enable APIs and services`
-   Search "Calendar", select "Google Calendar API"
-   Click "Credentials"
-   Click "+ Create Credentials" -> "OAuth 2.0 Client ID"
-   Application type: "Desktop app" -> Create
-   Download JSON.

And now use the ID and JSON file (plus your name) as a source for your off days:

```shell
$ yarn run-script src/scripts/SaveWorklogScript.ts [...] --off-days-source GOOGLE_CALENDAR_ID:google_calendar_client_secret.json:"Your Name OFF"
```
