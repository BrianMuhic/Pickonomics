import { redirect } from "next/navigation";
import { JoinLeagueForm } from "./JoinLeagueForm";
import { getCurrentUser } from "@/lib/auth";
import { LEAGUE_TYPE_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function JoinLeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true } },
      members: { where: { userId: user.id } },
    },
  });

  if (!league) redirect("/");
  if (league.members.length > 0) redirect(`/leagues/${id}`);

  return (
    <div className="card mx-auto max-w-md">
      <h1 className="page-title mb-3">Join {league.name}</h1>
      <div className="mb-5 flex flex-wrap gap-2">
        <span className="pill">{LEAGUE_TYPE_LABELS[league.leagueType]}</span>
        <span className="pill pill-muted">
          {league._count.members} member{league._count.members !== 1 ? "s" : ""}
        </span>
        <span className="pill pill-muted">{league.isPublic ? "Public" : "Private"}</span>
      </div>
      <JoinLeagueForm leagueId={league.id} isPublic={league.isPublic} />
    </div>
  );
}
