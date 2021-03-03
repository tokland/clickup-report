import { DateRange, TimeSummary } from "../entities";
import { TimeSummaryClickupRepository } from "../../data/TimeSummaryClickupRepository";
import { getStringDate } from "../../utils";

export class ShowTimeSummaryUseCase {
    constructor(private timeSummaryClickupRepository: TimeSummaryClickupRepository) {}

    execute(options: { dateRange: DateRange }): void {
        const { dateRange } = options;
        const timeSummary$ = this.timeSummaryClickupRepository.get(dateRange);

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
            `Total: ${showDuration(timeSummary.total)}`,
            "---",
            ...timeSummary.timeByFolder.map(({ folderName, duration: durationH }) => {
                return `${folderName}: ${showDuration(durationH)}`;
            }),
        ].join("\n");
    }
}

export function showDuration(duration: number): string {
    const s = duration.toFixed(2);
    return `${s}h`;
}
