import type { NextRequest } from "next/server";
import { LeagueType } from "@/generated/prisma/client";
import {
  isReminderHour,
  REMINDER_HOUR,
  reminderTimezone,
  sendWeeklyPickReminders,
} from "@/lib/reminders";

export const maxDuration = 60;

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    // Lets the endpoint be exercised locally; production always needs the secret.
    if (process.env.NODE_ENV !== "production") return true;
    console.error("CRON_SECRET is not set; refusing to run pick reminders");
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * TEMPORARY: one-off schedule (16:15 UTC = 12:15pm EDT) to verify the cron
 * pipeline live. Runs matching it skip the 10am hour gate. Remove this
 * schedule here and in vercel.json once the live test has passed.
 */
const TEST_CRON_SCHEDULE = "15 16 * * *";

/**
 * Daily pick reminder job. Vercel cron runs in UTC only, so this path is
 * scheduled at both UTC hours that can be REMINDER_HOUR locally and the run
 * outside that hour exits without sending. Pass `?force=1` to ignore the hour
 * check when triggering manually.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const force = request.nextUrl.searchParams.get("force") === "1";
  const isTestCron =
    request.headers.get("x-vercel-cron-schedule") === TEST_CRON_SCHEDULE;

  if (!force && !isTestCron && !isReminderHour(now)) {
    return Response.json({
      ran: false,
      reason: `not ${REMINDER_HOUR}:00 in ${reminderTimezone()}`,
    });
  }

  const result = await sendWeeklyPickReminders({ leagueTypes: [LeagueType.NFL], now });
  console.log(
    `Pick reminders: sent ${result.totalSent}, failed ${result.totalFailed} across ${result.leagues.length} league(s)`
  );

  return Response.json({ ran: true, ...result });
}
