import { Future } from "../../utils/future";
import { Async, OffDay } from "../entities";
import { WorkLog, WorkLogAttrs } from "../WorkLog";
import { OffDayRepository, WorkLogRepository } from "../repositories";
import { Day } from "../Day";

export type SaveWorkLogCommand = {
    worklog: Omit<WorkLogAttrs, "day">;
    from: Day;
    to: Day;
    userName: string | undefined;
    dryRun: boolean;
};

export class SaveWorklogUseCase {
    constructor(
        private options: {
            workLogRepository: WorkLogRepository;
            offDayRepository?: OffDayRepository;
        }
    ) {}

    execute(command: SaveWorkLogCommand): Async<void> {
        return Future.block(async $ => {
            const workLogsToSave = this.getWorkLogsToSave(command);
            const existingWorklogs = await $(this.getExistingWorklogs(command));
            const offDays = await $(this.getOffDays(command));

            for (const worklog of workLogsToSave) {
                await $(
                    this.processWorklog(worklog, {
                        existingWorklogs: existingWorklogs,
                        offDays: offDays,
                        dryRun: command.dryRun,
                    })
                );
            }
        });
    }

    private processWorklog(
        worklog: WorkLog,
        options: {
            existingWorklogs: WorkLog[];
            offDays: OffDay[];
            dryRun: boolean;
        }
    ): Async<void> {
        const { workLogRepository } = this.options;
        const { existingWorklogs, offDays, dryRun } = options;
        const worklogAlreadySaved = existingWorklogs.some(existingWorklog =>
            existingWorklog.day.equals(worklog.day)
        );

        switch (true) {
            case worklogAlreadySaved:
                console.debug(`${worklog.asString()} [skip, already saved]`);
                return Future.void();
            case offDays.some(offDay => offDay.day.equals(worklog.day)):
                console.debug(`${worklog.asString()} [skip, off day]`);
                return Future.void();
            case !worklog.day.isWorkingDay():
                console.debug(`${worklog.asString()} [skip, non-working day]`);
                return Future.void();
            default:
                if (dryRun) {
                    console.debug(`${worklog.asString()} [not saved, dry run]`);
                    return Future.void();
                } else {
                    console.debug(`${worklog.asString()} [saved]`);
                    return workLogRepository.save(worklog).toVoid();
                }
        }
    }

    private getWorkLogsToSave(command: SaveWorkLogCommand): WorkLog[] {
        return Day.range(command.from, command.to).map(day => {
            return WorkLog.create({ ...command.worklog, day: day });
        });
    }

    private getExistingWorklogs(command: SaveWorkLogCommand): Async<WorkLog[]> {
        const { workLogRepository } = this.options;
        console.debug(
            `Get existing worklogs: ${command.from.asString()} -> ${command.to.asString()}`
        );
        return workLogRepository.get(command);
    }

    private getOffDays(command: SaveWorkLogCommand): Async<OffDay[]> {
        const { offDayRepository } = this.options;

        if (!offDayRepository || !command.userName) {
            return Future.success([]);
        } else {
            console.debug(`Get off days: ${command.from.asString()} -> ${command.to.asString()}`);

            return offDayRepository
                .getList({
                    name: command.userName,
                    from: command.from,
                    to: command.to,
                })
                .tap(offDays => {
                    offDays.forEach(offDay => {
                        console.debug(`Off day: ${offDay.asString()}`);
                    });
                });
        }
    }
}
