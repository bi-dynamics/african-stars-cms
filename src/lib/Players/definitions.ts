import { Timestamp } from "firebase/firestore";

export type Players = {
  id: string;
  picture: string;
  detail_picture?: string;
  firstName: string;
  lastName: string;
  current_age: number;
  height?: number;
  nationality: string;
  date_of_birth: Timestamp;
  biography?: string;
  number: number;
  position: "Defender" | "Midfielder" | "Forward" | "Goalkeeper";
  foot: "left" | "right";
  joined_club: Timestamp;
  status: "active" | "draft";
};

export interface updatePlayers {
  picture?: string;
  detail_picture?: string;
  firstName?: string;
  lastName?: string;
  current_age?: number;
  height?: number;
  nationality?: string;
  date_of_birth?: Timestamp;
  biography?: string;
  number?: number;
  position?: "Defender" | "Midfielder" | "Forward" | "Goalkeeper";
  foot?: "left" | "right";
  joined_club?: Timestamp;
  status?: "active" | "draft";
}
