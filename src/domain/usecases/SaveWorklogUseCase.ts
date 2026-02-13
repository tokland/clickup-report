import { Future, log } from "../../utils/future";
import { Async } from "../entities";
import { WorkLog } from "../WorkLog";
import { WorkLogRepository } from "../repositories";

export class SaveWorklogUseCase {
    constructor(private worklogRepository: WorkLogRepository) {}

    execute(worklogs: WorkLog[], options: { dryRun: boolean }): Async<void> {
        const saveWorklogs$ = worklogs.map((worklog): Async<void> => {
            if (worklog.day.weekday === "Saturday" || worklog.day.weekday === "Sunday") {
                console.debug(`Skipping non-working day: ${worklog.asString()}`);
                return Future.success(undefined);
            } else if (options.dryRun) {
                return log(`[dryRun] To be saved: ${worklog.asString()}`);
            } else {
                return log(`Save: ${worklog.asString()}`)
                    .chain(this.worklogRepository.save(worklog))
                    .toVoid();
            }
        });

        return Future.sequential(saveWorklogs$).toVoid();
    }
}
