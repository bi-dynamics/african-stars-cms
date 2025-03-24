import { db } from "@/app/firebase/config";
import {
  DocumentSnapshot,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  endBefore,
  getDocs,
} from "firebase/firestore";
import { Fixtures } from "./definitions";

let lastDocumentSnapshot: DocumentSnapshot | null = null; //stores the last document fetched from previous query
let firstDocumentSnapshot: DocumentSnapshot | null = null; //stores the first document of the current page

export async function getFixtures(
  nextPage: boolean = false,
  prevPage: boolean = false
): Promise<Fixtures[]> {
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

    const fixtures: Fixtures[] = [];
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch fixtures data");
  }
}
