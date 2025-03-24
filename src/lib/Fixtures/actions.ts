"use server";

import { db } from "@/app/firebase/config";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { getErrorMessage } from "../utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createFixture(formData: FormData): Promise<void> {
  try {
    const data = Object.fromEntries(formData);
    const {
      away_team_id,
      home_team_id,
      "scores[home]": homeScore,
      "scores[away]": awayScore,
      match_date,
      "match_info[competitionStage]": competitionStage,
      "match_info[league]": league,
      "match_info[leg]": leg,
      status,
    } = data;

    const scores = {
      //   home: parseInt(homeScore.toString()),
      //   away: parseInt(awayScore.toString()),
      home: 0,
      away: 0,
    };

    const matchInfo = {
      competitionStage,
      league,
      leg,
    };

    await addDoc(collection(db, "live_matches"), {
      away_team_id,
      home_team_id,
      scores,
      match_date,
      //add match_date conversion
      match_info: matchInfo,
      status,
    });
  } catch (error) {
    throw error;
  }
  revalidatePath("/dashboard/fixtures-and-results");
  redirect("/dashboard/fixtures-and-results");
}

export async function deleteFixture(id: string) {
  try {
    await deleteDoc(doc(db, "live_matches", id));
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
