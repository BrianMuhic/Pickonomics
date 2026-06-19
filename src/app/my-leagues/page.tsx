import Link from "next/link";
import { redirect } from "next/navigation";
import { LeagueCard } from "@/components/LeagueCard";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyLeaguesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const myLeagues = await prisma.league.findMany({
    where: { members: { some: { userId: user.id } } },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="mb-2 text-2xl font-bold">My Leagues</h1>
        <p className="muted text-sm">Leagues you&apos;ve joined or created.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/leagues/new" className="btn btn-primary">
            Create League
          </Link>
          <Link href="/" className="btn">
            Browse Public Leagues
          </Link>
        </div>
      </div>

      {myLeagues.length === 0 ? (
        <div className="card">
          <p className="muted">
            You haven&apos;t joined any leagues yet.{" "}
            <Link href="/" className="text-link">
              Browse public leagues
            </Link>{" "}
            or{" "}
            <Link href="/leagues/new" className="text-link">
              create your own
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid-cards">
          {myLeagues.map((league) => (
            <LeagueCard
              key={league.id}
              id={league.id}
              name={league.name}
              leagueType={league.leagueType}
              isPublic={league.isPublic}
              memberCount={league._count.members}
              isMember
            />
          ))}
        </div>
      )}
    </div>
  );
}
