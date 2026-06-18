import Link from "next/link";

export function LeagueNav({
  leagueId,
  active,
}: {
  leagueId: string;
  active: "picks" | "leaderboard" | "games" | "picks-grid";
}) {
  const links = [
    { href: `/leagues/${leagueId}`, label: "My Picks", key: "picks" as const },
    { href: `/leagues/${leagueId}/leaderboard`, label: "Leaderboard", key: "leaderboard" as const },
    { href: `/leagues/${leagueId}/games`, label: "Games", key: "games" as const },
    { href: `/leagues/${leagueId}/all-picks`, label: "All Picks", key: "picks-grid" as const },
  ];

  return (
    <div className="league-nav">
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          className={`btn ${active === link.key ? "btn-primary" : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
