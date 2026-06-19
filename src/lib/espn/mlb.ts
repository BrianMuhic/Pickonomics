import { GAME_TIMEZONE } from "@/lib/datetime";
import { EspnGameData } from "./types";
import { mapEspnConference } from "./conferences";

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function getEasternCalendarDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: GAME_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: parseInt(get("year"), 10),
    month: parseInt(get("month"), 10),
    day: parseInt(get("day"), 10),
    weekday: WEEKDAY_MAP[get("weekday")] ?? 0,
  };
}

function mondayOfWeekMs(year: number, month: number, day: number, weekday: number) {
  const monday = new Date(Date.UTC(year, month - 1, day));
  monday.setUTCDate(monday.getUTCDate() - ((weekday + 6) % 7));
  return Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate());
}

const MLB_REGULAR_SEASON_TYPE = 2;

function isPlaceholderTeam(team: Record<string, unknown>): boolean {
  const abbreviation = String(team.abbreviation || team.shortDisplayName || "").toUpperCase();
  const displayName = String(team.displayName || team.name || "").toUpperCase();
  return abbreviation === "TBD" || displayName === "TBD" || displayName.includes("TBD");
}

function parseEspnEvent(event: Record<string, unknown>): EspnGameData | null {
  const season = event.season as Record<string, unknown> | undefined;
  if (season?.type !== MLB_REGULAR_SEASON_TYPE) return null;

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

  return {
    espnGameId: String(event.id),
    week: 1,
    kickoff: new Date(String(event.date)),
    status: statusLower,
    awayScore,
    homeScore,
    winner,
    away: {
      espnId: String(away.id),
      abbreviation: String(away.abbreviation || away.shortDisplayName || ""),
      displayName: String(away.displayName || away.name || ""),
      conference: "MLB",
    },
    home: {
      espnId: String(home.id),
      abbreviation: String(home.abbreviation || home.shortDisplayName || ""),
      displayName: String(home.displayName || home.name || ""),
      conference: "MLB",
    },
  };
}

function assignWeeks(games: EspnGameData[]): EspnGameData[] {
  if (games.length === 0) return games;

  const seasonStart = games.reduce(
    (earliest, game) => (game.kickoff < earliest ? game.kickoff : earliest),
    games[0].kickoff
  );
  const startCal = getEasternCalendarDate(seasonStart);
  const seasonStartMondayMs = mondayOfWeekMs(
    startCal.year,
    startCal.month,
    startCal.day,
    startCal.weekday
  );

  for (const game of games) {
    const cal = getEasternCalendarDate(game.kickoff);
    const gameMondayMs = mondayOfWeekMs(cal.year, cal.month, cal.day, cal.weekday);
    game.week =
      Math.floor((gameMondayMs - seasonStartMondayMs) / (7 * 24 * 60 * 60 * 1000)) + 1;
  }

  return games;
}

async function fetchMlbGamesForDateRange(startDate: string, endDate: string): Promise<EspnGameData[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?limit=1000&dates=${startDate}-${endDate}`;
  const response = await fetch(url, { next: { revalidate: 0 } });
  if (!response.ok) {
    throw new Error(`ESPN MLB API error: ${response.status}`);
  }

  const data = await response.json();
  const games: EspnGameData[] = [];

  for (const event of data.events || []) {
    const parsed = parseEspnEvent(event);
    if (parsed) {
      parsed.away.conference = mapEspnConference("MLB");
      parsed.home.conference = mapEspnConference("MLB");
      games.push(parsed);
    }
  }

  return games;
}

export async function fetchMlbSeasonGames(season: number): Promise<EspnGameData[]> {
  const monthRanges = [
    `${season}0301-${season}0331`,
    `${season}0401-${season}0430`,
    `${season}0501-${season}0531`,
    `${season}0601-${season}0630`,
    `${season}0701-${season}0731`,
    `${season}0801-${season}0831`,
    `${season}0901-${season}0930`,
    `${season}1001-${season}1031`,
  ];

  const byEspnId = new Map<string, EspnGameData>();
  for (const range of monthRanges) {
    const [startDate, endDate] = range.split("-");
    const games = await fetchMlbGamesForDateRange(startDate, endDate);
    for (const game of games) {
      byEspnId.set(game.espnGameId, game);
    }
  }

  return assignWeeks([...byEspnId.values()]);
}

export async function fetchMlbWeekGames(week: number, season: number): Promise<EspnGameData[]> {
  const all = await fetchMlbSeasonGames(season);
  return all.filter((g) => g.week === week);
}
