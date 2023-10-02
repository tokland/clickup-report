import { DateRange, TimeSummary } from "../entities";
import { TimeSummaryClickupRepository } from "../../data/TimeSummaryClickupRepository";
import { getStringDate } from "../../date-utils";

export class ShowTimeSummaryUseCase {
    constructor(private timeSummaryClickupRepository: TimeSummaryClickupRepository) {}

    execute(options: { dateRange: DateRange }): void {
        const { dateRange } = options;
        const timeSummary$ = this.timeSummaryClickupRepository.get({
            ...dateRange,
            allUsers: false,
        });

        timeSummary$.run(timeSummary => {
            const summaryReportString = this.timeSummaryToString(timeSummary);
            console.log(summaryReportString);
        }, console.error);
    }

    timeSummaryToString(timeSummary: TimeSummary): string {
        const { dateRange, timeTasks } = timeSummary;

        return [
            `Period: ${getStringDate(dateRange.start)} -> ${getStringDate(dateRange.end)}`,
            `Time entries: ${timeTasks.length}`,
            "---",
            ...timeSummary.timeByFolder.map(({ folderName, duration: durationH }) => {
                return `${folderName}: ${showDuration(durationH)}`;
            }),
            "---",
            ...timeTasks.map(task =>
                [
                    task.date.toDateString(),
                    showHumanDuration(task.duration),
                    task.taskName,
                    task.note,
                    `https://app.clickup.com/t/${task.taskId}`,
                ].join(" - ")
            ),
            `Total: ${showHumanDuration(timeSummary.total)}`,
        ].join("\n");
    }
}

export function showDuration(hours: number): string {
    const s = hours.toFixed(2);
    return `${s}h`;
}

export function showHumanDuration(hours: number): string {
    const hoursInt = Math.floor(hours);
    const decimal = hours % 1;
    const m = Math.round(decimal * 60)
        .toString()
        .padStart(2, "0");
    return `${hoursInt}h${m}m`;
}
