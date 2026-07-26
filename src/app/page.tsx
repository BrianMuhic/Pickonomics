import Image from "next/image";
import Link from "next/link";
import { LeagueCard } from "@/components/LeagueCard";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MIN_SEARCH_LENGTH = 2;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentUser();
  const { q } = await searchParams;
  const searchQuery = q?.trim() ?? "";

  const publicLeaguesRaw = await prisma.league.findMany({
    where: { isPublic: true },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const memberLeagueIds = user
    ? new Set(
        (
          await prisma.leagueMember.findMany({
            where: { userId: user.id, leagueId: { in: publicLeaguesRaw.map((l) => l.id) } },
            select: { leagueId: true },
          })
        ).map((m) => m.leagueId)
      )
    : new Set<string>();

  const publicLeagues = publicLeaguesRaw.map((league) => ({
    ...league,
    isMember: memberLeagueIds.has(league.id),
  }));

  const privateSearchResultsRaw =
    searchQuery.length >= MIN_SEARCH_LENGTH
      ? await prisma.league.findMany({
          where: {
            isPublic: false,
            name: { contains: searchQuery, mode: "insensitive" },
          },
          include: { _count: { select: { members: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [];

  const privateSearchMemberIds = user
    ? new Set(
        (
          await prisma.leagueMember.findMany({
            where: {
              userId: user.id,
              leagueId: { in: privateSearchResultsRaw.map((l) => l.id) },
            },
            select: { leagueId: true },
          })
        ).map((m) => m.leagueId)
      )
    : new Set<string>();

  const privateSearchResults = privateSearchResultsRaw.map((league) => ({
    ...league,
    isMember: privateSearchMemberIds.has(league.id),
  }));

  const myLeagues = user
    ? await prisma.league.findMany({
        where: { members: { some: { userId: user.id } } },
        include: { _count: { select: { members: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-10">
      <section className="card card-hero">
        <div className="hero-brand-row">
          <Image src="/logo.png" alt="" width={64} height={64} priority />
          <h1 className="hero-brand">
            Pick<span className="brand-o">o</span>nomics
          </h1>
        </div>
        <p className="hero-tagline">
          Pick weekly winners across NFL, MLB, ACC, SEC, and Big Ten — then climb the season
          leaderboard.
        </p>
        {user ? (
          <div className="hero-actions">
            <Link href="/leagues/new" className="btn btn-primary-on-dark">
              Create League
            </Link>
            <Link href="/my-leagues" className="btn btn-on-dark">
              My Leagues
            </Link>
          </div>
        ) : (
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary-on-dark">
              Get started
            </Link>
            <Link href="/login" className="btn btn-on-dark">
              Log in
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">Find Private Leagues</h2>
        <p className="muted mb-4 text-sm">
          Search by league name. You will need the league password to join.
        </p>
        <form method="get" className="mb-4 flex flex-wrap gap-2">
          <input
            className="field-input min-w-[200px] flex-1"
            type="search"
            name="q"
            placeholder="Search private leagues..."
            defaultValue={searchQuery}
            minLength={MIN_SEARCH_LENGTH}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
        {searchQuery.length > 0 && searchQuery.length < MIN_SEARCH_LENGTH && (
          <p className="muted">Enter at least {MIN_SEARCH_LENGTH} characters to search.</p>
        )}
        {searchQuery.length >= MIN_SEARCH_LENGTH && (
          <>
            {privateSearchResults.length === 0 ? (
              <p className="muted">No private leagues found matching &ldquo;{searchQuery}&rdquo;.</p>
            ) : (
              <div className="grid-cards">
                {privateSearchResults.map((league) => (
                  <LeagueCard
                    key={league.id}
                    id={league.id}
                    name={league.name}
                    leagueType={league.leagueType}
                    isPublic={league.isPublic}
                    memberCount={league._count.members}
                    isMember={league.isMember}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {user && myLeagues.length > 0 && (
        <section>
          <h2 className="section-title mb-4">My Leagues</h2>
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
        </section>
      )}

      <section>
        <h2 className="section-title mb-4">Public Leagues</h2>
        {publicLeagues.length === 0 ? (
          <p className="muted">No public leagues yet. Be the first to create one!</p>
        ) : (
          <div className="grid-cards">
            {publicLeagues.map((league) => (
              <LeagueCard
                key={league.id}
                id={league.id}
                name={league.name}
                leagueType={league.leagueType}
                isPublic={league.isPublic}
                memberCount={league._count.members}
                isMember={league.isMember}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
