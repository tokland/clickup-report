## Setup

```shell
$ nvm use
$ yarn install
$ cp config-template.json config.json
```

And modify `config.json` with your particular configuration.

## Usage

Get a summary report for a month (default interval):

```shell
$ yarn run-script src/scripts/get-report.ts -d 2026-01
```

Create worklogs for some interval of days (Saturday and Sunday will be automatically excluded):

```shell
$ yarn run-script src/scripts/save-worklog.ts --start-time 09:00 --end-time 13:30 --signature="Arnau Sanchez" --user-legal-id="12345678N" --user-id 6813404 --list-id 901215049998 --date 2026-02-14..2026-02-16 --dry-run
```
