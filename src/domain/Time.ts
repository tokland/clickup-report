export class Time {
    private constructor(public hours: number, public minutes: number) {}

    static fromString(timeStr: string): Time {
        const [hoursStr, minutesStr] = timeStr.split(":");
        if (hoursStr === undefined || minutesStr === undefined) {
            throw new Error(`Invalid time string: ${timeStr}`);
        }
        return new Time(parseInt(hoursStr), parseInt(minutesStr));
    }

    subtract(other: Time): Time {
        const totalMinutes = this.hours * 60 + this.minutes - (other.hours * 60 + other.minutes);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return new Time(hours, minutes);
    }

    asString(): string {
        const hoursStr = this.hours.toString().padStart(2, "0");
        const minutesStr = this.minutes.toString().padStart(2, "0");
        return `${hoursStr}:${minutesStr}`;
    }
}
