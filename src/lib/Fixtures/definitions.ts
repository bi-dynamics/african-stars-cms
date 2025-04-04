import { DocumentReference, Timestamp } from "firebase/firestore";

export interface Fixtures {
  id: string;
  home_team: {
    name: string;
    logo: string;
  };
  away_team: {
    name: string;
    logo: string;
  };
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
