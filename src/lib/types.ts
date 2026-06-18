export const LEAGUE_TYPES = ["NFL", "ACC", "SEC", "BIG_TEN"] as const;
export type LeagueTypeValue = (typeof LEAGUE_TYPES)[number];

export const CONFERENCES = ["NFL", "ACC", "SEC", "BIG_TEN", "OTHER"] as const;
export type ConferenceValue = (typeof CONFERENCES)[number];
