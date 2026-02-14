/**
 * Represents a calendar day with year, month, and day properties.
 */
export class Day {
    static weekDays: Weekday[] = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    private constructor(public year: number, public month: number, public day: number) {}

    // Day.range(Day(2024, 1, 1), Day(2024, 1, 3)) => [Day(2024, 1, 1), Day(2024, 1, 2), Day(2024, 1, 3)]
    static range(startDay: Day, endDayInclusive: Day): Day[] {
        const days: Day[] = [];
        let current = startDay;
        while (current.toDate() <= endDayInclusive.toDate()) {
            days.push(current);
            const nextDate = new Date(current.year, current.month - 1, current.day + 1);
            current = Day.fromDate(nextDate);
        }
        return days;
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

    // Day.fromString("2024-01-15") => Day(2024, 1, 15)
    static fromString(dateStr: string): Day {
        const [yearS, monthS, dayS] = dateStr.split(/[-/]/);
        if (yearS === undefined || monthS === undefined || dayS === undefined) {
            throw new Error(`Invalid date string: ${dateStr}`);
        }
        return new Day(parseInt(yearS), parseInt(monthS), parseInt(dayS));
    }

    // Day(2024, 1, 15).weekday => "Tuesday"
    get weekday(): Weekday {
        const date = this.toDate();
        const dayOfWeek = date.getUTCDay(); // 0 (Sunday) to 6 (Saturday)
        const weekday = Day.weekDays[(dayOfWeek + 6) % 7]; // Adjust so that Monday is 0
        if (!weekday) {
            throw new Error(`Invalid day of week: ${dayOfWeek}`);
        }
        return weekday;
    }

    // Day(2024, 1, 15).format("DD/MM/YYYY") => "15/01/2024"
    format(pattern: string): string {
        const dayStr = this.day.toString().padStart(2, "0");
        const monthStr = this.month.toString().padStart(2, "0");
        const yearStr = this.year.toString();

        return pattern.replace("DD", dayStr).replace("MM", monthStr).replace("YYYY", yearStr);
    }

    // Day(2024, 1, 15).toDate() => new Date(2024, 0, 15)
    toDate(): Date {
        return new Date(this.msFromEpoch());
    }

    // Day(2024, 1, 15).msFromEpoch() => 1705132800000
    msFromEpoch(): number {
        return Date.UTC(this.year, this.month - 1, this.day);
    }
}

type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
