import { Future } from "../../utils/future";
import { Async } from "../entities";
import { WorkLog, WorkLogAttrs } from "../WorkLog";
import { WorkLogRepository } from "../repositories";
import { Day } from "../Day";

export type SaveWorkLogCommand = {
    worklog: Omit<WorkLogAttrs, "day">;
    from: Day;
    to: Day;
    dryRun: boolean;
};

export class SaveWorklogUseCase {
    constructor(private worklogRepository: WorkLogRepository) {}

    execute(command: SaveWorkLogCommand): Async<void> {
        return Future.block(async $ => {
            const workLogs = Day.range(command.from, command.to).map(day => {
                return WorkLog.create({ ...command.worklog, day: day });
            });

            console.debug(`Get existing: ${command.from.asString()} -> ${command.to.asString()}`);
            const existingWorklogs = await $(this.worklogRepository.get(command));

            for (const worklog of workLogs) {
                const worklogExists = existingWorklogs.some(w => w.day.equals(worklog.day));

                if (worklogExists) {
                    console.debug(`Worklog already exists, skipping: ${worklog.asString()}`);
                } else if (!worklog.day.isWorkingDay()) {
                    console.debug(`Skipping non-working day: ${worklog.asString()}`);
                } else if (command.dryRun) {
                    console.debug(`[dryRun] Save: ${worklog.asString()}`);
                } else {
                    console.debug(`Save: ${worklog.asString()}`);
                    await $(this.worklogRepository.save(worklog));
                }
            }
        });
    }
}
