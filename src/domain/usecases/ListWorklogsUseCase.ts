import { Future } from "../../utils/future";
import { Async, TimeEntry } from "../entities";
import { WorkLog } from "../WorkLog";
import { TimeEntryRepository, WorkLogRepository } from "../repositories";
import { Day } from "../Day";
import _ from "lodash";
import { Time } from "../Time";

export type ListWorklogsCommand = {
    userId: string;
    from: Day;
    to: Day;
};

export class ListWorklogsUseCase {
    constructor(
        private options: {
            workLogRepository: WorkLogRepository;
            timeEntryRepository: TimeEntryRepository;
        }
    ) {}

    execute(command: ListWorklogsCommand): Async<void> {
        return Future.block(async $ => {
            const worklogs = await $(this.getWorklogs(command));
            const timeEntries = await $(this.getTimeEntries(command));

            const expectedWorkedHours = Time.sum(worklogs.map(worklog => worklog.totalHours));
            const actualWorkedHours = Time.sum(timeEntries.map(timeEntry => timeEntry.duration));
            const diffTime = actualWorkedHours.subtract(expectedWorkedHours);

            for (const worklog of worklogs) {
                console.debug(worklog.asString());
            }
            console.debug(`Expected worked hours: ${expectedWorkedHours.asString()}`);
            console.debug(`Actual worked hours: ${actualWorkedHours.asString()}`);
            console.debug(`Difference: ${diffTime.asString()}`);
        });
    }

    private getTimeEntries(command: ListWorklogsCommand): Async<TimeEntry[]> {
        return this.options.timeEntryRepository.get({
            userId: command.userId,
            from: command.from,
            to: command.to,
        });
    }

    private getWorklogs(command: ListWorklogsCommand): Async<WorkLog[]> {
        const { workLogRepository } = this.options;
        const { from, to } = command;
        console.debug(`Get worklogs: ${from.asString()} -> ${to.asString()}`);

        return workLogRepository.get(command).map(worklogs => {
            return _(worklogs)
                .sortBy(worklog => worklog.day.asString())
                .value();
        });
    }
}
