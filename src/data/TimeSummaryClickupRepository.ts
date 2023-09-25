import _ from "lodash";

import { ClickupApi } from "./ClickupApi";
import { FutureData, Task, TaskId, TimeEntry } from "./ClickupApi.types";
import { TimeTask, DateRange, TimeSummary } from "../domain/entities";
import { Future } from "../utils/future";

interface TimeEntriesInfo {
    timeEntries: TimeEntry[];
    tasks: Task[];
}

export interface UserFilter {
    teamName: string;
    userEmail: string | undefined;
}

interface TimeSummaryClickupRepositoryGetOptions extends DateRange {
    allUsers: boolean;
}

export class TimeSummaryClickupRepository {
    constructor(private api: ClickupApi, private userFilter: UserFilter) {}

    get(dateRange: TimeSummaryClickupRepositoryGetOptions): FutureData<TimeSummary> {
        const data$ = this.getData(dateRange);
        const timeTasks$ = data$.map(data => {
            const tasksById = _.keyBy(data.tasks, task => task.id);
            return data.timeEntries.map(timeEntry => this.getTimeTask(timeEntry, tasksById));
        });

        return timeTasks$.map(timeTasks => this.getTimeSummary(timeTasks, dateRange));
    }

    private getTimeTask(timeEntry: TimeEntry, tasksById: Record<TaskId, Task>): TimeTask {
        const timeEntryJson = JSON.stringify(timeEntry, null, 4);
        if (typeof timeEntry.task === "string") throw new Error(`No task for: ${timeEntryJson}`);

        const task = tasksById[timeEntry.task.id];
        if (!task) throw new Error(`Cannot find task for time entry: ${timeEntryJson}`);

        return {
            username: timeEntry.user.username,
            taskId: task.id,
            taskName: task.name,
            list: { name: task.list.name },
            projectName: [task.folder.name, task.list.name].join(" - "),
            date: new Date(parseInt(timeEntry.start)),
            duration: parseInt(timeEntry.duration) / 1000 / 3600,
            note: timeEntry.description,
        };
    }

    private getData(options: TimeSummaryClickupRepositoryGetOptions): FutureData<TimeEntriesInfo> {
        const { api, userFilter: config } = this;
        const { userEmail } = config;
        const team$ = api
            .getTeams()
            .map(teams => teams.find(team => team.name === config.teamName))
            .orError("Team not found");

        return team$.flatMap(team => {
            const timeEntries$ = api
                .getTimeEntries({
                    teamId: team.id,
                    startDate: options.start,
                    endDate: options.end,
                    assignee: options.allUsers
                        ? team.members.map(member => member.user.id)
                        : undefined,
                })
                .map(timeEntries =>
                    timeEntries.filter(entry => !userEmail || entry.user.email === userEmail)
                );

            return timeEntries$.flatMap(timeEntries => {
                // console.log(timeEntries);
                const tasks$ = _(timeEntries)
                    .map(timeEntry => (typeof timeEntry.task !== "string" ? timeEntry.task : null))
                    .compact()
                    .map(task => api.getTask({ taskId: task.id }))
                    .value();

                return Future.parallel(tasks$, { maxConcurrency: 1 }).map(tasks => {
                    return { timeEntries, tasks };
                });
            });
        });
    }

    private getTimeSummary(timeTasks: TimeTask[], dateRange: DateRange): TimeSummary {
        const timeByFolder = _(timeTasks)
            .groupBy(timeTask => timeTask.projectName)
            .mapValues((timeTasksForFolder, folderName) => ({
                folderName,
                duration: _.sum(timeTasksForFolder.map(tt => tt.duration)),
            }))
            .values()
            .sortBy(({ folderName }) => folderName)
            .value();

        const total = _(timeTasks)
            .map(tt => tt.duration)
            .sum();

        return { total, timeTasks, timeByFolder: timeByFolder, dateRange };
    }
}
