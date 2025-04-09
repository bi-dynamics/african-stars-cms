import { Timestamp } from "firebase/firestore";

export interface Fixtures {
  id: string;
  away_team_id: string;
  home_team_id: string;
  scores?: {
    home: number;
    away: number;
  };
  match_date: Timestamp;
  match_info: {
    competitionStage: string;
    league: string;
    leg: string;
  };
  status: "active" | "draft";
}

export interface updateFixtures {
  away_team_id?: string;
  home_team_id?: string;
  scores?: {
    home?: number;
    away?: number;
  };
  match_date?: Timestamp;
  match_info?: {
    competitionStage?: string;
    league?: string;
    leg?: string;
  };
  status?: "active" | "draft";
}
