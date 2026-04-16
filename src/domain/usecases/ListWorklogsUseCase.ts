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
            const daysWithTimeEntries = _(timeEntries)
                .map(timeEntry => timeEntry.start.toLocaleDateString())
                .uniq()
                .value();

            const expectedWorkedHours = Time.sum(worklogs.map(worklog => worklog.totalHours));
            const actualWorkedHours = Time.sum(timeEntries.map(timeEntry => timeEntry.duration));
            const [hours1, hours2] =
                actualWorkedHours < expectedWorkedHours
                    ? [actualWorkedHours, expectedWorkedHours]
                    : [expectedWorkedHours, actualWorkedHours];
            const diffTime = hours2.subtract(hours1);
            const sign = hours1 == actualWorkedHours ? "-" : "+";

            console.debug(`Expected: ${expectedWorkedHours.asString()} (${worklogs.length} days)`);
            console.debug(
                `Actual  : ${actualWorkedHours.asString()} (${daysWithTimeEntries.length} days)`
            );
            console.debug(`Difference: ${sign}${diffTime.asString()}`);
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
