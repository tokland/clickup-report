import { WorkLogClickupRepository } from "../data/WorkLogClickupRepository";
import { Day } from "../domain/Day";
import { Time } from "../domain/Time";
import { SaveWorklogUseCase, SaveWorkLogCommand } from "../domain/usecases/SaveWorklogUseCase";
import { OffDayGoogleCalendarRepository } from "../data/OffDayGoogleCalendarRepository";
import { getBaseConfig } from "./common";

import { command, option, flag, run, Type, optional } from "cmd-ts";

function saveWorklog(args: SaveWorkLogArgs): void {
    const { api } = getBaseConfig();
    const workLogRepository = new WorkLogClickupRepository(api, { listId: args.listId });
    const [startDate, endDate] = getDateRange(args.dateRange);

    const command: SaveWorkLogCommand = {
        worklog: {
            startTime: Time.fromString(args.startTime),
            endTime: Time.fromString(args.endTime),
            signature: args.signature,
            userId: args.userId,
        },
        from: startDate,
        to: endDate,
        dryRun: args.dryRun,
        userName: args.offDays?.namePattern,
    };

    const offDayRepository = args.offDays
        ? new OffDayGoogleCalendarRepository({
              calendarId: args.offDays.calendarId,
              credentialsPath: args.offDays.credentialsPath,
          })
        : undefined;

    new SaveWorklogUseCase({ workLogRepository, offDayRepository }).execute(command).run(
        () => {},
        err => console.error("Error saving worklogs:", err)
    );
}

function getDateFromString(s: string): Day {
    switch (true) {
        // Relative day, e.g. "-5" means 5 days ago from today, "+3" means 3 days in the future
        case /^[-+]?\d+$/.test(s): {
            const offset = parseInt(s);
            return Day.today().addDays(offset);
        }
        case /^\d+-\d+-\d+$/.test(s):
            return Day.fromString(s, "YYYY-MM-DD");
        default:
            throw new Error(`Invalid date format: ${s}`);
    }
}

// getDateRange("2024-06-01..2024-06-30", "YYYY-MM-DD") -> [Day(2024, 06, 01), Day(2024, 06, 30)]
// getDateRange("2024/06/01", "YYYY/MM/DD")             -> [Day(2024, 06, 01), Day(2024, 06, 01)]
// getDataRange("-5..1") -> [Day(2024, 06, 10), Day(2024, 06, 16)] (if today is June 15, 2024)
function getDateRange(s: string): [Day, Day] {
    const parts = s.split("..");
    const [part1, part2] = parts;

    if (parts.length < 1 || parts.length > 2 || !part1) {
        throw new Error(`Invalid date range: ${s}`);
    } else if (part1 && part2) {
        const startDay = getDateFromString(part1);
        const endDay = getDateFromString(part2);
        return [startDay, endDay];
    } else {
        const startAndEndDay = getDateFromString(part1);
        return [startAndEndDay, startAndEndDay];
    }
}

type SaveWorkLogArgs = Parameters<typeof saveWorkLogCommand.handler>[0];

const googleCalendarEventSource: Type<
    string,
    { calendarId: string; credentialsPath: string; namePattern: string }
> = {
    async from(str) {
        const parts = str.split(":");
        const [calendarId, credentialsPath, namePattern] = parts;

        if (parts.length !== 3 || !calendarId || !credentialsPath || !namePattern) {
            throw new Error(`Expected "CALENDAR_ID:CREDENTIALS_PATH:NAME", got "${str}"`);
        }

        return { calendarId, credentialsPath, namePattern };
    },
};

const saveWorkLogCommand = command({
    name: "save-worklog",
    description: "Save worklogs as a ClickUp task",
    args: {
        dateRange: option({ long: "date", description: "Date (YYYY-MM-DD)" }),
        userId: option({ long: "user-id", description: "ClickUp user ID" }),
        listId: option({ long: "list-id", description: "ClickUp list ID" }),
        startTime: option({ long: "start-time", description: "Start time (HH:MM)" }),
        endTime: option({ long: "end-time", description: "End time (HH:MM)" }),
        signature: option({ long: "signature", description: "Signature (Your name)" }),
        dryRun: flag({ long: "dry-run", description: "Dry run (don't actually save any worklog)" }),
        offDays: option({
            type: optional(googleCalendarEventSource),
            long: "off-days-source",
            description: "Google off days source (e.g. CALENDAR_ID:CREDENTIALS_PATH:NAME_PATTERN)",
        }),
    },
    handler: args => {
        saveWorklog(args);
    },
});

run(saveWorkLogCommand, process.argv.slice(2));
