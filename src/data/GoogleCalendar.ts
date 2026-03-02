import { calendar_v3, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { authenticate } from "@google-cloud/local-auth";
import fs from "fs";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");

async function getAuthClient(options: { credentialsPath: string }): Promise<OAuth2Client> {
    const { credentialsPath } = options;

    if (fs.existsSync(TOKEN_PATH)) {
        const credentials = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
        return google.auth.fromJSON(credentials) as OAuth2Client;
    }

    const auth = await authenticate({ scopes: SCOPES, keyfilePath: credentialsPath });
    const keys = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
    const key = keys.installed || keys.web;

    const tokenPayload = {
        type: "authorized_user",
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: auth.credentials.refresh_token,
    };

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenPayload, null, 2) + "\n");

    return auth;
}

export async function getCalendarEvents(
    credentialsPath: string,
    calendarId: string,
    startDate: string, // "YYYY-MM-DD"
    endDate: string // "YYYY-MM-DD"
): Promise<CalendarDayEvent[]> {
    const auth = await getAuthClient({ credentialsPath });
    const calendar = google.calendar({ version: "v3", auth });

    const events: calendar_v3.Schema$Event[] = [];
    let pageToken: string | undefined;

    do {
        const response = await calendar.events.list({
            calendarId: calendarId, // "primary" || "c_ID@group.calendar.google.com"
            timeMin: new Date(`${startDate}T00:00:00Z`).toISOString(),
            timeMax: new Date(`${endDate}T23:59:59Z`).toISOString(),
            singleEvents: true,
            orderBy: "startTime",
            pageToken: pageToken,
        });

        events.push(...(response.data.items ?? []));
        pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);

    const days = new Set<CalendarDayEvent>();

    for (const event of events) {
        const start = event.start?.date ?? event.start?.dateTime?.slice(0, 10);
        const end = event.end?.date ?? event.end?.dateTime?.slice(0, 10);

        if (!start || !end) continue;

        // For all-day events, end date is exclusive; for timed events, include end day
        const isAllDay = Boolean(event.start?.date);
        const cursor = new Date(start);
        const endDate = new Date(end);

        while (cursor < endDate || (!isAllDay && cursor <= endDate)) {
            const dayStr = cursor.toISOString().slice(0, 10);
            const eventName = event.summary ?? "";
            days.add({ day: dayStr, name: eventName });
            cursor.setDate(cursor.getDate() + 1);
        }
    }

    return Array.from(days);
}

type CalendarDayEvent = {
    name: string;
    day: string; // "YYYY-MM-DD"
};
