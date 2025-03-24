import { DocumentReference, Timestamp } from "firebase/firestore";

export interface Fixtures {
  id: string;
  away_team_id: DocumentReference;
  home_team_id: DocumentReference;
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
  status: string;
}
