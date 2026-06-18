"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { fetchScoresAction } from "@/actions/leagues";

export function FetchScoresButton({ leagueId }: { leagueId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetchScoresAction(leagueId);
          router.refresh();
        });
      }}
    >
      {pending ? "Fetching..." : "Fetch Scores"}
    </button>
  );
}
