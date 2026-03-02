/**
 * Represent a moment in a day with hours and minutes (HH:MM)
 */
export class Time {
    private constructor(public hours: number, public minutes: number) {}

    // Time.fromString("14:30") => Time(14, 30)
    static fromString(timeStr: string): Time {
        const [hoursStr, minutesStr] = timeStr.split(":");
        if (hoursStr === undefined || minutesStr === undefined) {
            throw new Error(`Invalid time string: ${timeStr}`);
        }
        return new Time(parseInt(hoursStr), parseInt(minutesStr));
    }

    // Time(4, 30).subtract(Time(1, 10)) => Time(3, 20)
    subtract(other: Time): Time {
        const totalMinutes = this.hours * 60 + this.minutes - (other.hours * 60 + other.minutes);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return new Time(hours, minutes);
    }

    // Time(2, 45).asString() => "02:45"
    asString(): string {
        const hoursStr = this.hours.toString().padStart(2, "0");
        const minutesStr = this.minutes.toString().padStart(2, "0");
        return `${hoursStr}:${minutesStr}`;
    }
}
