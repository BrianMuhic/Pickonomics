export interface EspnGameData {
  espnGameId: string;
  week: number;
  kickoff: Date;
  status: string;
  awayScore: number | null;
  homeScore: number | null;
  winner: "home" | "away" | null;
  away: {
    espnId: string;
    abbreviation: string;
    displayName: string;
    conference: string | null;
  };
  home: {
    espnId: string;
    abbreviation: string;
    displayName: string;
    conference: string | null;
  };
}
