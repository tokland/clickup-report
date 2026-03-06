/**
 * A calendar day (year, month, and day).
 */
export class Day {
    static weekDays: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    private constructor(
        public year: number,
        public month: number, // 1-based month (1 for January, 12 for December)
        public day: number
    ) {
        Day.validate({ year, month, day });
    }

    private static validate(options: { year: number; month: number; day: number }) {
        const { year, month, day } = options;
        const date = new Date(Date.UTC(year, month - 1, day));

        if (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() + 1 !== month ||
            date.getUTCDate() !== day
        ) {
            throw new Error(`Invalid date: year=${year}, month=${month}, day=${day}`);
        }
    }

    // Day.today() => Day(2024, 1, 15) (if today is January 15, 2024)
    static today(): Day {
        const now = new Date();
        return Day.fromDate(now);
    }

    // Day.range(Day(2024, 1, 1), Day(2024, 1, 3)) => [Day(2024, 1, 1), Day(2024, 1, 2), Day(2024, 1, 3)]
    static range(startDay: Day, endDayInclusive: Day): Day[] {
        const days: Day[] = [];
        let current = startDay;
        while (current.toDate() <= endDayInclusive.toDate()) {
            days.push(current);
            current = current.addDays(1);
        }
        return days;
    }

    // Day(2024, 1, 15).addDays(5) => Day(2024, 1, 20)
    addDays(days: number): Day {
        const date = this.toDate();
        date.setDate(date.getDate() + days);
        return Day.fromDate(date);
    }

    // Day.fromDate(new Date(2024, 0, 15)) => Day(2024, 1, 15)
    static fromDate(date: Date): Day {
        return new Day(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    // Day.from({ year: 2024, month: 1, day: 15 }) => Day(2024, 1, 15)
    static from(options: { year: number; month: number; day: number }): Day {
        const { year, month, day } = options;
        return new Day(year, month, day);
    }

    // Day.fromString("2024-01-15", "YYYY-MM-DD") => Day(2024, 1, 15)
    static fromString(dateStr: string, pattern: string): Day {
        const yearS = pattern.includes("YYYY")
            ? dateStr.substr(pattern.indexOf("YYYY"), 4)
            : undefined;
        const monthS = pattern.includes("MM")
            ? dateStr.substr(pattern.indexOf("MM"), 2)
            : undefined;
        const dayS = pattern.includes("DD") ? dateStr.substr(pattern.indexOf("DD"), 2) : undefined;

        if (!yearS || !monthS || !dayS) {
            throw new Error(`Invalid date string: ${dateStr}`);
        }
        return new Day(parseInt(yearS), parseInt(monthS), parseInt(dayS));
    }

    // Day(2024, 1, 15).weekday => "Tuesday"
    get weekday(): Weekday {
        const dayOfWeek = this.toDate().getUTCDay(); // 0 (Sunday) to 6 (Saturday)
        const weekday = Day.weekDays[(dayOfWeek + 6) % 7]; // Adjust so that Monday is 0
        if (!weekday) {
            throw new Error(`Invalid day of week: ${dayOfWeek}`);
        }
        return weekday;
    }

    // Day(2024, 1, 15).equals(Day(2024, 1, 15)) => true
    equals(other: Day): boolean {
        return this.year === other.year && this.month === other.month && this.day === other.day;
    }

    // Day(2024, 1, 15).isBetween(Day(2024, 1, 1), Day(2024, 1, 31)) => true
    isBetween(startDay: Day, endDayInclusive: Day): boolean {
        const date = this.toDate();
        return date >= startDay.toDate() && date <= endDayInclusive.toDate();
    }

    // Day(2024, 1, 15).isWorkingDay() => true (as it's a Monday, not a Saturday or Sunday)
    isWorkingDay(): boolean {
        return this.weekday !== "Sat" && this.weekday !== "Sun";
    }

    // Day(2024, 1, 15).format("DD/MM/YYYY") => "15/01/2024"
    format(pattern: string): string {
        const dayStr = this.day.toString().padStart(2, "0");
        const monthStr = this.month.toString().padStart(2, "0");
        const yearStr = this.year.toString();

        return pattern.replace("DD", dayStr).replace("MM", monthStr).replace("YYYY", yearStr);
    }

    // Day(2024, 1, 15).asString() => "2024-01-15 [Mon]"
    asString(): string {
        return `${this.format("YYYY-MM-DD")} [${this.weekday}]`;
    }

    // Day(2024, 1, 15).toDate() => new Date(2024, 0, 15)
    toDate(): Date {
        return new Date(this.msFromEpoch());
    }

    // Day(2024, 1, 15).msFromEpoch() => 1705132800000 (UNIX epoch is January 1, 1970, 00:00:00 UTC)
    msFromEpoch(): number {
        return Date.UTC(this.year, this.month - 1, this.day);
    }
}

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
