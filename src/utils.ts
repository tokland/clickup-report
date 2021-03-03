import { DateTime } from "luxon";

export function getStringDate(date: Date): string {
    const s = date.toISOString().split("T")[0];
    if (!s) throw new Error("Cannot get date");
    return s;
}

export function parseDate(stringDate: string): DateTime {
    const date = DateTime.fromISO(stringDate, { zone: "UTC" });

    if (!date.isValid) {
        throw new Error(`Invalid date: ${stringDate}`);
    } else {
        return date;
    }
}
