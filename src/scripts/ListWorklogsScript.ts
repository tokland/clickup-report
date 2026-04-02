import { WorkLogClickupRepository } from "../data/WorkLogClickupRepository";
import { getBaseConfig } from "./common";

import { command, option, run } from "cmd-ts";
import { getDateRange } from "./SaveWorklogScript";
import { ListWorklogsCommand, ListWorklogsUseCase } from "../domain/usecases/ListWorklogsUseCase";
import { TimeEntryClickupRepository } from "../data/TimeEntryClickupRepository";

function listWorkLogs(args: ListWorkLogsArgs): void {
    const { api } = getBaseConfig();
    const workLogRepository = new WorkLogClickupRepository(api, { listId: args.listId });
    const timeEntryRepository = new TimeEntryClickupRepository({ api });
    const [startDate, endDate] = getDateRange(args.dateRange);

    const command: ListWorklogsCommand = {
        userId: args.userId,
        from: startDate,
        to: endDate,
    };

    new ListWorklogsUseCase({ workLogRepository, timeEntryRepository }).execute(command).run(
        () => {},
        err => console.error("Error:", err)
    );
}

type ListWorkLogsArgs = Parameters<typeof listWorkLogsCommand.handler>[0];

const listWorkLogsCommand = command({
    name: "list-worklogs",
    description: "List worklogs from ClickUp",
    args: {
        dateRange: option({ long: "date", description: "Date (YYYY-MM-DD)" }),
        userId: option({ long: "user-id", description: "ClickUp user ID" }),
        listId: option({ long: "list-id", description: "ClickUp list ID" }),
    },
    handler: args => {
        listWorkLogs(args);
    },
});

if (require.main === module) {
    run(listWorkLogsCommand, process.argv.slice(2));
}
