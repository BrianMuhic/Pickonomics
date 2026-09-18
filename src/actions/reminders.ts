"use server";

import { LeagueType } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { sendWeeklyPickReminders } from "@/lib/reminders";
import type { ActionResult } from "./auth";

/** Runs the daily pick reminder job on demand, ignoring the 10am schedule. */
export async function sendPickRemindersAction(): Promise<ActionResult> {
  await requireAdmin();

  try {
    const result = await sendWeeklyPickReminders({ leagueTypes: [LeagueType.NFL] });

    if (result.totalSent === 0 && result.totalFailed === 0) {
      const alreadyReminded = result.leagues.reduce((sum, l) => sum + l.alreadyReminded, 0);
      return {
        success: alreadyReminded > 0
          ? "Everyone with outstanding picks was already reminded today"
          : "No reminders were due right now",
      };
    }

    const sent = `Sent ${result.totalSent} reminder${result.totalSent === 1 ? "" : "s"}`;
    if (result.totalFailed > 0) {
      return { error: `${sent}, but ${result.totalFailed} failed to send` };
    }
    return { success: sent };
  } catch (e) {
    console.error("Send pick reminders error:", e);
    return { error: "Failed to send pick reminders" };
  }
}
