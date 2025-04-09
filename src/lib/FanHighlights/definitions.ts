import { Timestamp } from "firebase/firestore";

export interface FanHighlights {
  id: string;
  date_posted: Timestamp;
  src: string;
  status: "active" | "draft";
}

export interface updateFanHighlightsType {
  src?: string;
  status?: "active" | "draft";
}
