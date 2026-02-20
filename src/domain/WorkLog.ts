import { Day } from "./Day";
import { Time } from "./Time";
import { Struct } from "./Struct";

export type WorkLogAttrs = {
    userId: string;
    day: Day;
    startTime: Time;
    endTime: Time;
    signature: string;
};

export class WorkLog extends Struct<WorkLogAttrs>() {
    asString(): string {
        const { day, startTime, endTime, totalHours } = this;
        return [
            `Worklog ${day.format("YYYY-MM-DD")} [${day.weekday}]:`,
            `${startTime.asString()} -> ${endTime.asString()}`,
            `(${totalHours.asString()})`,
        ].join(" ");
    }

    get totalHours(): Time {
        return this.endTime.subtract(this.startTime);
    }
}
