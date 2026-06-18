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
      <h1 className="mb-2 text-2xl font-bold">Join {league.name}</h1>
      <p className="muted mb-4">
        {LEAGUE_TYPE_LABELS[league.leagueType]} · {league._count.members} members ·{" "}
        {league.isPublic ? "Public" : "Private"}
      </p>
      <JoinLeagueForm leagueId={league.id} isPublic={league.isPublic} />
    </div>
  );
}
