import { getCalendarEvents } from "./GoogleCalendar";
import { Future } from "../utils/future";
import { Day } from "../domain/Day";
import { Async, OffDay } from "../domain/entities";
import { OffDayRepository } from "../domain/repositories";

export class OffDayGoogleCalendarRepository implements OffDayRepository {
    constructor(private options: { calendarId: string; credentialsPath: string }) {}

    getList(options: { name: string; from: Day; to: Day }): Async<OffDay[]> {
        const events$ = getCalendarEvents(
            this.options.credentialsPath,
            this.options.calendarId,
            options.name,
            options.from.format("YYYY-MM-DD"),
            options.to.format("YYYY-MM-DD")
        );

        return Future.fromPromise(events$).map((events): OffDay[] => {
            return events.map(event =>
                OffDay.create({
                    userId: options.name,
                    day: Day.fromString(event.day, "YYYY-MM-DD"),
                })
            );
        });
    }
}
