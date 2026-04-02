/**
 * A moment in a day (hour and minute).
 */
export class Time {
    private constructor(
        public hours: number, //
        public minutes: number
    ) {}

    // Time.fromHours(2.5) => Time(2, 30)
    static fromHours(hoursDecimal: number): Time {
        const hours = Math.floor(hoursDecimal);
        const minutes = Math.round((hoursDecimal - hours) * 60);
        return new Time(hours, minutes);
    }

    // Time.fromString("14:30") => Time(14, 30)
    static fromString(timeStr: string): Time {
        const [hoursStr, minutesStr] = timeStr.split(":");
        if (hoursStr === undefined || minutesStr === undefined) {
            throw new Error(`Invalid time string: ${timeStr}`);
        }
        return new Time(parseInt(hoursStr), parseInt(minutesStr));
    }

    // Time.zero() => Time(0, 0)
    static zero(): Time {
        return new Time(0, 0);
    }

    // Time.sum([Time(1, 30), Time(2, 45)]) => Time(4, 15)
    static sum(times: Time[]): Time {
        return times.reduce((sum, time) => sum.add(time), Time.zero());
    }

    // Time(2, 30).add(Time(1, 45)) => Time(4, 15)
    add(other: Time): Time {
        const totalMinutes = this.hours * 60 + this.minutes + other.hours * 60 + other.minutes;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return new Time(hours, minutes);
    }

    // Time(4, 30).subtract(Time(1, 10)) => Time(3, 20)
    subtract(other: Time): Time {
        const totalMinutes = this.hours * 60 + this.minutes - (other.hours * 60 + other.minutes);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return new Time(hours, minutes);
    }

    // Time(2, 45).asString() => "02h45m"
    asString(): string {
        const hoursStr = this.hours.toString().padStart(2, "0");
        const minutesStr = this.minutes.toString().padStart(2, "0");
        return `${hoursStr}h${minutesStr}m`;
    }
}
