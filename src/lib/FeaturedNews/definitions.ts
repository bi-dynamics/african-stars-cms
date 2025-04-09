import { Timestamp } from "firebase/firestore";

export type FeaturedNews = {
  id: string;
  datePosted: Timestamp;
  title: string;
  description: string;
  picture: string;
  status: "active" | "draft";
};

export interface updateFeaturedNewsType {
  title?: string;
  description?: string;
  picture?: string;
  status?: "active" | "draft";
}
