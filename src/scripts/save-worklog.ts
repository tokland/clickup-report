import { WorkLogClickupRepository } from "../data/WorkLogClickupRepository";
import { Day } from "../domain/Day";
import { Time } from "../domain/Time";
import { SaveWorklogUseCase, SaveWorkLogCommand } from "../domain/usecases/SaveWorklogUseCase";
import { getBaseConfig } from "./common";

import { command, option, flag, run } from "cmd-ts";

function main(args: SaveWorkLogArgs): void {
    const { api } = getBaseConfig();
    const timeSummaryRepository = new WorkLogClickupRepository(api, { listId: args.listId });
    const [startDate, endDate] = getDateRange(args.date, "YYYY-MM-DD");

    const command: SaveWorkLogCommand = {
        worklog: {
            startTime: Time.fromString(args.startTime),
            endTime: Time.fromString(args.endTime),
            signature: args.signature,
            userLegalId: args.userLegalId,
            userId: args.userId,
        },
        from: startDate,
        to: endDate,
        dryRun: args.dryRun,
    };

    const saveWorklog = new SaveWorklogUseCase(timeSummaryRepository);

    saveWorklog.execute(command).run(
        () => console.log("Done"),
        err => console.error("Error saving worklogs:", err)
    );
}

// getDateRange("2024-06-01..2024-06-30", "YYYY-MM-DD") -> [Day(2024, 06, 01), Day(2024, 06, 30)]
// getDateRange("2024/06/01", "YYYY/MM/DD")             -> [Day(2024, 06, 01), Day(2024, 06, 01)]
function getDateRange(s: string, pattern: string): [Day, Day] {
    const parts = s.split("..");
    const [part1, part2] = parts;

    if (parts.length < 1 || parts.length > 2 || !part1) {
        throw new Error(`Invalid date range: ${s}`);
    } else if (part1 && part2) {
        const startDay = Day.fromString(part1, pattern);
        const endDay = Day.fromString(part2, pattern);
        return [startDay, endDay];
    } else {
        const day = Day.fromString(part1, pattern);
        return [day, day];
    }
}

type SaveWorkLogArgs = Parameters<typeof saveWorkLogCommand.handler>[0];

const saveWorkLogCommand = command({
    name: "save-worklog",
    description: "Save worklogs as a ClickUp task",
    args: {
        date: option({ long: "date", description: "Date (YYYY-MM-DD)" }),
        userLegalId: option({ long: "user-legal-id", description: "User legal ID (NIF)" }),
        userId: option({ long: "user-id", description: "ClickUp user ID" }),
        listId: option({ long: "list-id", description: "ClickUp list ID" }),
        startTime: option({ long: "start-time", description: "Start time (HH:MM)" }),
        endTime: option({ long: "end-time", description: "End time (HH:MM)" }),
        signature: option({ long: "signature", description: "Signature" }),
        dryRun: flag({ long: "dry-run", description: "Dry run (don't actually save the worklog)" }),
    },
    handler: args => {
        main(args);
    },
});

run(saveWorkLogCommand, process.argv.slice(2));
