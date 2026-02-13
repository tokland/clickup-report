import { WorkLogClickupRepository } from "../data/WorkLogClickupRepository";
import { Day } from "../domain/Day";
import { Time } from "../domain/Time";
import { WorkLog } from "../domain/WorkLog";
import { SaveWorklogUseCase } from "../domain/usecases/SaveWorklogUseCase";
import { getBaseConfig } from "./common";

import { command, option, string, flag, run } from "cmd-ts";

function main(args: SaveWorkLogArgs) {
    const { api } = getBaseConfig();
    const timeSummaryRepository = new WorkLogClickupRepository(api, { listId: args.listId });
    const [startDate, endDate] = getDateRangeFromString(args.date);

    const workLogs = Day.range(startDate, endDate).map(day => {
        return WorkLog.create({
            day: day,
            startTime: Time.fromString(args.startTime),
            endTime: Time.fromString(args.endTime),
            signature: args.signature,
            userLegalId: args.userLegalId,
            userId: args.userId,
        });
    });

    console.debug(`Saving ${workLogs.length} worklogs for date range "${args.date}"`);

    const saveWorklog = new SaveWorklogUseCase(timeSummaryRepository);

    saveWorklog.execute(workLogs, { dryRun: Boolean(args.dryRun) }).run(
        () => console.log("Done"),
        err => console.error("Error saving worklogs:", err)
    );
}

// getDataRangeFromString("2024-06-01") -> [Day(2024, 06, 01), Day(2024, 06, 01)]
// getDataRangeFromString("2024-06-01..2024-06-30") -> [Day(2024, 06, 01), Day(2024, 06, 30)]
function getDateRangeFromString(s: string): [Day, Day] {
    const parts = s.split("..");
    const [part1, part2] = parts;

    if (parts.length < 1 || parts.length > 2 || !part1) {
        throw new Error(`Invalid date range: ${s}`);
    } else if (part1 && part2) {
        const startDay = Day.fromString(part1);
        const endDay = Day.fromString(part2);
        return [startDay, endDay];
    } else {
        const day = Day.fromString(part1);
        return [day, day];
    }
}

type SaveWorkLogArgs = Parameters<typeof saveWorkLogCommand.handler>[0];

const saveWorkLogCommand = command({
    name: "save-worklog",
    description: "Save a worklog to ClickUp",
    args: {
        date: option({
            type: string,
            long: "date",
            description: "Date (YYYY-MM-DD)",
        }),

        userLegalId: option({
            type: string,
            long: "user-legal-id",
            description: "User legal ID (NIF)",
        }),

        userId: option({
            type: string,
            long: "user-id",
            description: "ClickUp user ID",
        }),

        listId: option({
            type: string,
            long: "list-id",
            description: "ClickUp list ID",
        }),

        startTime: option({
            type: string,
            long: "start-time",
            description: "Start time (HH:MM)",
        }),

        endTime: option({
            type: string,
            long: "end-time",
            description: "End time (HH:MM)",
        }),

        signature: option({
            type: string,
            long: "signature",
            description: "Signature",
        }),

        dryRun: flag({
            long: "dry-run",
            description: "Dry run (don't actually save the worklog)",
        }),
    },

    handler: async args => {
        main(args);
    },
});

run(saveWorkLogCommand, process.argv.slice(2));
