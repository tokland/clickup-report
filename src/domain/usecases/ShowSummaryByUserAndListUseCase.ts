import { DateRange, TimeSummary, TimeTask } from "../entities";
import _ from "lodash";
import { TimeSummaryClickupRepository } from "../../data/TimeSummaryClickupRepository";
import { getStringDate } from "../../date-utils";

export class ShowSummaryByUserAndListUseCase {
    constructor(private timeSummaryClickupRepository: TimeSummaryClickupRepository) {}

    execute(options: { dateRange: DateRange }): void {
        const { dateRange } = options;
        const timeSummary$ = this.timeSummaryClickupRepository.get({
            ...dateRange,
            allUsers: true,
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
            ..._(timeTasks)
                .groupBy(task => task.username)
                .toPairs()
                .map(([username, tasks]) => this.getStringEntriesByList(username, tasks))
                .value(),
        ].join("\n");
    }

    private getStringEntriesByList(username: string, tasks: TimeTask[]): string {
        return [
            `- ${username} (${getTasksTotalDuration(tasks)}):`,
            ..._(tasks)
                .groupBy(task => task.list.name)
                .toPairs()
                .map(([listName, tasks]) => {
                    return `  - ${listName}: ${getTasksTotalDuration(tasks)}`;
                })
                .value(),
        ].join("\n");
    }
}

function getTasksTotalDuration(tasks: TimeTask[]): string {
    return showHumanDuration(
        _(tasks)
            .map(task => task.duration)
            .sum()
    );
}

function _showDuration(hours: number): string {
    const s = hours.toFixed(2);
    return `${s}h`;
}

function showHumanDuration(hours: number): string {
    const hoursInt = Math.floor(hours);
    const decimal = hours % 1;
    const m = Math.round(decimal * 60)
        .toString()
        .padStart(2, "0");
    return `${hoursInt}h${m}m`;
}
