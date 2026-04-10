import { Day } from "../domain/Day";
import { Async, TimeEntry } from "../domain/entities";
import { TimeEntryRepository } from "../domain/repositories";
import { Time } from "../domain/Time";
import { Future } from "../utils/future";
import { ClickupApi } from "./ClickupApi";

export class TimeEntryClickupRepository implements TimeEntryRepository {
    constructor(
        private options: {
            api: ClickupApi;
        }
    ) {}

    get(options: { userId: string; from: Day; to: Day }): Async<TimeEntry[]> {
        const { api } = this.options;
        const { userId, from, to } = options;

        return Future.block(async $ => {
            const teams = await $(api.getTeams());
            const team = teams.find(team =>
                team.members.some(member => member.user.id.toString() === userId)
            );

            if (!team) {
                return $.error(new Error(`Team with id ${userId} not found`));
            }

            const timeEntries = await $(
                api.getTimeEntries({
                    teamId: team.id,
                    startDate: from.toDate(),
                    endDate: to.addDays(1).toDate(),
                    assignee: [parseInt(userId)],
                })
            );

            return timeEntries.map(
                (timeEntry): TimeEntry => ({
                    id: timeEntry.id,
                    taskId:
                        typeof timeEntry.task === "string"
                            ? timeEntry.task
                            : typeof timeEntry.task !== "object"
                            ? "UNKNOWN_TASK"
                            : timeEntry.task.id,
                    userId: timeEntry.user.id.toString(),
                    start: new Date(parseInt(timeEntry.start)),
                    end: new Date(parseInt(timeEntry.end)),
                    duration: Time.fromHours(parseInt(timeEntry.duration) / 1000 / 3600),
                })
            );
        });
    }
}
