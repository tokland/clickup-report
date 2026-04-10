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

    // Time.fromString("14:30")  => Time(14, 30)
    // Time.fromString("2h") => Time(2, 0)
    // Time.fromString("30m") => Time(0, 30)
    // Time.fromString("14h30") => Time(14, 30)
    // Time.fromString("14h30m") => Time(14, 30)
    static fromString(timeStr: string): Time {
        const text = timeStr?.trim().toLowerCase() ?? "";
        if (!text) throw new Error("Time.fromString: empty string");

        const parse = (pattern: RegExp): RegExpExecArray | null => pattern.exec(text);
        const toInt = (value: string | undefined): number => Number(value ?? 0);

        const parseClockTime = (): Time | null => {
            const match = parse(/^(\d{1,2}):(\d{1,2})$/);
            return match ? new Time(toInt(match[1]), toInt(match[2])) : null;
        };

        const parseHourMinuteTime = (): Time | null => {
            const match = parse(/^(\d+)\s*h(?:\s*(\d+)\s*m?)?$/);
            return match ? new Time(toInt(match[1]), toInt(match[2])) : null;
        };

        const parseMinuteTime = (): Time | null => {
            const match = parse(/^(\d+)\s*m$/);
            return match ? new Time(0, toInt(match[1])) : null;
        };

        const throw_ = (msg: string): never => {
            throw new Error(msg);
        };

        return (
            parseClockTime() ||
            parseHourMinuteTime() ||
            parseMinuteTime() ||
            throw_(`Time.fromString: invalid time format: "${timeStr}"`)
        );
    }

    // Time.zero() => Time(0, 0)
    static zero(): Time {
        return new Time(0, 0);
    }

    // Time.sum([Time(1, 30), Time(2, 45)]) => Time(4, 15)
    static sum(times: Time[]): Time {
        return times.reduce((sum, time) => sum.add(time), Time.zero());
    }

    // Time(2, 30).valueOf() => 150
    valueOf(): number {
        return this.hours * 60 + this.minutes;
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

    // Time(2, 45).asString() => "02:45"
    asString(): string {
        const hoursStr = this.hours.toString().padStart(2, "0");
        const minutesStr = this.minutes.toString().padStart(2, "0");
        return `${hoursStr}:${minutesStr}`;
    }
}
