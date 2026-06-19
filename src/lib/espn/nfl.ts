import { EspnGameData } from "./types";
import { mapEspnConference } from "./conferences";

const NFL_REGULAR_SEASON_TYPE = 2;

function isPlaceholderTeam(team: Record<string, unknown>): boolean {
  const abbreviation = String(team.abbreviation || team.shortDisplayName || "").toUpperCase();
  const displayName = String(team.displayName || team.name || "").toUpperCase();
  return abbreviation === "TBD" || displayName === "TBD" || displayName.includes("TBD");
}

function parseEspnEvent(event: Record<string, unknown>): EspnGameData | null {
  const season = event.season as Record<string, unknown> | undefined;
  if (season?.type !== NFL_REGULAR_SEASON_TYPE) return null;

  const competition = (event.competitions as Record<string, unknown>[])?.[0];
  if (!competition) return null;

  const competitors = competition.competitors as Record<string, unknown>[];
  const awayTeam = competitors?.find((c) => c.homeAway === "away") as Record<string, unknown> | undefined;
  const homeTeam = competitors?.find((c) => c.homeAway === "home") as Record<string, unknown> | undefined;
  if (!awayTeam || !homeTeam) return null;

  const away = awayTeam.team as Record<string, unknown>;
  const home = homeTeam.team as Record<string, unknown>;
  if (isPlaceholderTeam(away) || isPlaceholderTeam(home)) return null;
  const status = ((event.status as Record<string, unknown>)?.type as Record<string, unknown>)?.name as string;
  const statusLower = (status || "scheduled").toLowerCase();

  const awayScore = awayTeam.score != null ? parseInt(String(awayTeam.score), 10) : null;
  const homeScore = homeTeam.score != null ? parseInt(String(homeTeam.score), 10) : null;

  let winner: "home" | "away" | null = null;
  if (
    (statusLower === "final" || statusLower.includes("final")) &&
    awayScore != null &&
    homeScore != null &&
    awayScore !== homeScore
  ) {
    winner = awayScore > homeScore ? "away" : "home";
  }

  const weekObj = event.week as Record<string, unknown> | undefined;
  const week = (weekObj?.number as number) || 1;

  return {
    espnGameId: String(event.id),
    week,
    kickoff: new Date(String(event.date)),
    status: statusLower,
    awayScore,
    homeScore,
    winner,
    away: {
      espnId: String(away.id),
      abbreviation: String(away.abbreviation || away.shortDisplayName || ""),
      displayName: String(away.displayName || away.name || ""),
      conference: "NFL",
    },
    home: {
      espnId: String(home.id),
      abbreviation: String(home.abbreviation || home.shortDisplayName || ""),
      displayName: String(home.displayName || home.name || ""),
      conference: "NFL",
    },
  };
}

export async function fetchNflSeasonGames(season: number): Promise<EspnGameData[]> {
  const startDate = `${season}0901`;
  const endDate = `${season + 1}0201`;
  const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=1000&dates=${startDate}-${endDate}`;

  const response = await fetch(url, { next: { revalidate: 0 } });
  if (!response.ok) {
    throw new Error(`ESPN NFL API error: ${response.status}`);
  }

  const data = await response.json();
  const games: EspnGameData[] = [];

  for (const event of data.events || []) {
    const parsed = parseEspnEvent(event);
    if (parsed) {
      parsed.away.conference = mapEspnConference("NFL");
      parsed.home.conference = mapEspnConference("NFL");
      games.push(parsed);
    }
  }

  return games;
}

export async function fetchNflWeekGames(week: number, season: number): Promise<EspnGameData[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=1000&dates=${season}&seasontype=${NFL_REGULAR_SEASON_TYPE}&week=${week}`;

  const response = await fetch(url, { next: { revalidate: 0 } });
  if (!response.ok) {
    throw new Error(`ESPN NFL API error: ${response.status}`);
  }

  const data = await response.json();
  const games: EspnGameData[] = [];

  for (const event of data.events || []) {
    const parsed = parseEspnEvent(event);
    if (parsed) {
      parsed.away.conference = mapEspnConference("NFL");
      parsed.home.conference = mapEspnConference("NFL");
      games.push(parsed);
    }
  }

  return games;
}
