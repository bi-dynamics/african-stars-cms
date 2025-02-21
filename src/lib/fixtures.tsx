import { db } from "@/app/firebase/config";
import {
  addDoc,
  collection,
  DocumentReference,
  DocumentSnapshot,
  endBefore,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
} from "firebase/firestore";

export interface FixturesData {
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

let lastDocumentSnapshot: DocumentSnapshot | null = null; //stores the last document fetched from previous query
let firstDocumentSnapshot: DocumentSnapshot | null = null; //stores the first document of the current page

export async function getFixtures(
  nextPage: boolean = false,
  prevPage: boolean = false
): Promise<FixturesData[]> {
  const ref = collection(db, "live_matches");
  let q = query(ref, orderBy("match_date", "desc"), limit(5));

  if (nextPage && lastDocumentSnapshot) {
    // If it's the next page, start after the last document of the previous page
    q = query(
      ref,
      orderBy("match_date", "desc"),
      startAfter(lastDocumentSnapshot),
      limit(5)
    );
  }

  if (prevPage && firstDocumentSnapshot) {
    q = query(
      ref,
      orderBy("match_date", "desc"),
      endBefore(firstDocumentSnapshot),
      limit(5)
    );
  }

  try {
    const querySnapshot = await getDocs(q);

    const fixtures: FixturesData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fixtures.push({
        id: doc.id,

        away_team_id: data.away_team_id,
        home_team_id: data.home_team_id,
        match_date: data.match_date,
        scores: {
          home: data.scores?.home,
          away: data.scores?.away,
        },
        match_info: {
          competitionStage: data.match_info.competitionStage,
          league: data.match_info.league,
          leg: data.match_info.leg,
        },
        status: data.status,
      });
    });

    if (querySnapshot.docs.length > 0) {
      lastDocumentSnapshot = querySnapshot.docs[querySnapshot.docs.length - 1]; // Update lastDocumentSnapshot. Set it to the last doc of the snapshot
      firstDocumentSnapshot = querySnapshot.docs[0]; //update firstDocumentSnapshot to be the first doc in the snapshot
    } else {
      lastDocumentSnapshot = null; // No more documents
      firstDocumentSnapshot = null;
    }

    return fixtures;
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return [];
  }
}

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
      home: parseInt(homeScore.toString()),
      away: parseInt(awayScore.toString()),
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
    console.error("Error creating fixture:", error);
    throw error;
  }
}
