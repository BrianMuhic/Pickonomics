import type { ConferenceValue, LeagueTypeValue } from "@/lib/types";

export const LEAGUE_TYPE_LABELS: Record<LeagueTypeValue, string> = {
  NFL: "NFL",
  ACC: "ACC",
  SEC: "SEC",
  BIG_TEN: "Big Ten",
};

export const LEAGUE_TYPE_TO_CONFERENCE: Record<LeagueTypeValue, ConferenceValue> = {
  NFL: "NFL",
  ACC: "ACC",
  SEC: "SEC",
  BIG_TEN: "BIG_TEN",
};

// ESPN college football conference group IDs
export const ESPN_CONFERENCE_GROUPS: Record<Exclude<LeagueTypeValue, "NFL">, number> = {
  ACC: 1,
  SEC: 8,
  BIG_TEN: 5,
};

export const NFL_REGULAR_SEASON_WEEKS = 18;
export const COLLEGE_REGULAR_SEASON_WEEKS = 15;

export function maxWeeksForLeague(leagueType: LeagueTypeValue) {
  return leagueType === "NFL" ? NFL_REGULAR_SEASON_WEEKS : COLLEGE_REGULAR_SEASON_WEEKS;
}

export function currentSeasonYear() {
  const now = new Date();
  const year = now.getFullYear();
  // Jan–Feb: prior season (bowls/playoffs). Mar–Dec: season kicking off that calendar year.
  return now.getMonth() >= 2 ? year : year - 1;
}
