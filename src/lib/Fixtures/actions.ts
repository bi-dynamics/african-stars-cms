"use server";

import { db } from "@/app/firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getErrorMessage } from "../utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateFixtures } from "./definitions";

export async function createFixture(formData: FormData): Promise<void> {
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
    home: homeScore,
    away: awayScore,
  };

  const matchInfo = {
    competitionStage,
    league,
    leg,
  };

  // Convert match_date to Timestamp
  const timestampMatchDate = Timestamp.fromDate(
    new Date(match_date.toString())
  );

  await addDoc(collection(db, "live_matches"), {
    away_team_id,
    home_team_id,
    scores,
    match_date: timestampMatchDate,
    match_info: matchInfo,
    status,
  });

  revalidatePath("/dashboard/fixtures-and-results");
  redirect("/dashboard/fixtures-and-results");
}

type FixturesStatus = "active" | "draft";

export async function updateFixture(id: string, formData: FormData) {
  const data = Object.fromEntries(formData);
  const {
    away_team_id: rawAwayTeamId,
    home_team_id: rawHomeTeamId,
    "scores[home]": rawHomeScore,
    "scores[away]": rawAwayScore,
    match_date,
    "match_info[competitionStage]": rawCompetitionStage,
    "match_info[league]": rawLeague,
    "match_info[leg]": rawLeg,
    status: rawStatus,
  } = data;

  const updateData: updateFixtures = {}; // Create an object to store updated fields

  const away_team_id = rawAwayTeamId?.toString(); // Convert to string if it exists
  const home_team_id = rawHomeTeamId?.toString(); // Convert to string if it exists
  const homeScore = parseInt(rawHomeScore?.toString());
  const awayScore = parseInt(rawAwayScore?.toString());
  const competitionStage = rawCompetitionStage?.toString();
  const league = rawLeague?.toString();
  const leg = rawLeg?.toString();
  const status = rawStatus as FixturesStatus;

  if (away_team_id) {
    updateData.away_team_id = away_team_id;
  }
  if (home_team_id) {
    updateData.home_team_id = home_team_id;
  }
  if (homeScore) {
    updateData.scores = { ...updateData.scores, home: homeScore };
  }
  if (awayScore) {
    updateData.scores = { ...updateData.scores, away: awayScore };
  }
  if (match_date) {
    // Convert match_date to Timestamp
    const timestampMatchDate = Timestamp.fromDate(
      new Date(match_date.toString())
    );
    updateData.match_date = timestampMatchDate;
  }
  if (competitionStage) {
    updateData.match_info = {
      ...updateData.match_info,
      competitionStage: competitionStage,
    };
  }
  if (league) {
    updateData.match_info = { ...updateData.match_info, league: league };
  }
  if (leg) {
    updateData.match_info = { ...updateData.match_info, leg: leg };
  }
  if (status) {
    updateData.status = status;
  }

  if (Object.keys(updateData).length > 0) {
    // Only update if there are changes
    await updateDoc(doc(db, "live_matches", id), {
      ...updateData,
    });
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
