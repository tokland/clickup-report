import { Future, log } from "../../utils/future";
import { Async } from "../entities";
import { WorkLog, WorkLogAttrs } from "../WorkLog";
import { WorkLogRepository } from "../repositories";
import { Day } from "../Day";

export type WorkLogCommand = {
    worklog: Omit<WorkLogAttrs, "day">;
    from: Day;
    to: Day;
    dryRun: boolean;
};

export class SaveWorklogUseCase {
    constructor(private worklogRepository: WorkLogRepository) {}

    execute(command: WorkLogCommand): Async<void> {
        const workLogs = Day.range(command.from, command.to).map(day => {
            return WorkLog.create({ ...command.worklog, day: day });
        });

        return this.worklogRepository
            .get({ from: command.from, to: command.to })
            .flatMap(existingWorklogs => {
                const saveWorklogs$ = workLogs.map((worklog): Async<void> => {
                    const { weekday } = worklog.day;
                    const alreadyExists = existingWorklogs.some(w => w.day.equals(worklog.day));

                    if (alreadyExists) {
                        console.debug(`Worklog already exists, skipping: ${worklog.asString()}`);
                        return Future.void();
                    } else if (weekday === "Saturday" || weekday === "Sunday") {
                        console.debug(`Skipping non-working day: ${worklog.asString()}`);
                        return Future.void();
                    } else if (command.dryRun) {
                        return log(`[dryRun] Save: ${worklog.asString()}`);
                    } else {
                        return log(`Save: ${worklog.asString()}`)
                            .chain(this.worklogRepository.save(worklog))
                            .toVoid();
                    }
                });

                return Future.sequential(saveWorklogs$).toVoid();
            });
    }
}
