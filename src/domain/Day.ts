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

    static range(start: Day, end: Day): Day[] {
        const days: Day[] = [];
        let current = start;
        while (current.toDate() <= end.toDate()) {
            days.push(current);
            const nextDate = new Date(current.year, current.month - 1, current.day + 1);
            current = Day.fromDate(nextDate);
        }
        return days;
    }

    static fromDate(date: Date): Day {
        return new Day(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    static from(options: { year: number; month: number; day: number }): Day {
        const { year, month, day } = options;
        return new Day(year, month, day);
    }

    static fromString(dateStr: string): Day {
        const [yearS, monthS, dayS] = dateStr.split(/[-/]/);
        if (yearS === undefined || monthS === undefined || dayS === undefined) {
            throw new Error(`Invalid date string: ${dateStr}`);
        }
        return new Day(parseInt(yearS), parseInt(monthS), parseInt(dayS));
    }

    get weekday(): Weekday {
        const date = this.toDate();
        const dayOfWeek = date.getUTCDay(); // 0 (Sunday) to 6 (Saturday)
        const weekday = Day.weekDays[(dayOfWeek + 6) % 7]; // Adjust so that Monday is 0
        if (!weekday) {
            throw new Error(`Invalid day of week: ${dayOfWeek}`);
        }
        return weekday;
    }

    format(pattern: string): string {
        const dayStr = this.day.toString().padStart(2, "0");
        const monthStr = this.month.toString().padStart(2, "0");
        const yearStr = this.year.toString();

        return pattern.replace("DD", dayStr).replace("MM", monthStr).replace("YYYY", yearStr);
    }

    toDate(): Date {
        return new Date(this.msFromEpoch());
    }

    msFromEpoch(): number {
        return Date.UTC(this.year, this.month - 1, this.day);
    }
}

type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
