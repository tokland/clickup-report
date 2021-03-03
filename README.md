## Setup

```
$ yarn install
$ cp config-template.json config.json
```

And modify `config.json` with your particular configuration.

## Usage

Get a summary report for a month (default interval):

```
$ yarn get-report -d 2021-03
```

Get a summary report for a specific interval:

```
$ yarn get-report src/scripts/clickup-report.ts -d 2021-01-01 -e 2021-03-15
```
