import { calendar_v3, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import path from "path";
import readline from "readline";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");

async function getAuthClient(options: { credentialsPath: string }): Promise<OAuth2Client> {
    const { credentialsPath } = options;

    const keys = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
    const key = keys.installed || keys.web;
    const redirectUri = key.redirect_uris?.[0] ?? "urn:ietf:wg:oauth:2.0:oob";
    const client = new google.auth.OAuth2(key.client_id, key.client_secret, redirectUri);

    if (fs.existsSync(TOKEN_PATH)) {
        const credentials = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
        client.setCredentials({ refresh_token: credentials.refresh_token });
        return client;
    }

    const authUrl = client.generateAuthUrl({ access_type: "offline", scope: SCOPES });

    console.log("\nAuthorize this app by visiting this URL:\n");
    console.log(authUrl);
    console.log(
        "\nAfter approving, your browser will be redirected to a URL like:\n" +
            "  http://localhost/?iss=...&code=THE_CODE_IS_HERE&scope=...\n" +
            "Copy the value of the `code` query parameter (everything between `code=` and the next `&`)\n" +
            "and paste it below.\n"
    );

    const code = await promptUser("Enter the code: ");
    const { tokens } = await client.getToken(code.trim());
    client.setCredentials(tokens);

    const tokenPayload = {
        type: "authorized_user",
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: tokens.refresh_token,
    };

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenPayload, null, 2) + "\n");

    return client;
}

function promptUser(question: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer);
        });
    });
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
