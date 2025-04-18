import { db } from "@/app/firebase/config";
import {
  collection,
  doc,
  DocumentSnapshot,
  endBefore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { Players } from "./definitions";

let lastDocumentSnapshot: DocumentSnapshot | null = null; //stores the last document fetched from previous query
let firstDocumentSnapshot: DocumentSnapshot | null = null; //stores the first document of the current page

export async function getPlayers(
  nextPage: boolean = false,
  prevPage: boolean = false
): Promise<Players[]> {
  const ref = collection(db, "players");
  let q = query(ref, orderBy("number", "asc"), limit(10));

  if (nextPage && lastDocumentSnapshot) {
    // If it's the next page, start after the last document of the previous page
    q = query(
      ref,
      orderBy("lastName", "asc"),
      startAfter(lastDocumentSnapshot),
      limit(10)
    );
  }

  if (prevPage && firstDocumentSnapshot) {
    q = query(
      ref,
      orderBy("lastName", "asc"),
      endBefore(firstDocumentSnapshot),
      limit(10)
    );
  }

  try {
    const querySnapshot = await getDocs(q);
    const players: Players[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      players.push({
        id: doc.id,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        number: data.number || "",
        position: data.position || "",
        picture: data.picture || "",
        detail_picture: data.detail_picture || "",
        current_age: data.current_age || 0,
        height: data.height || 0,
        foot: data.foot || "",
        biography: data.biography || "",
        nationality: data.nationality || "",
        date_of_birth: data.date_of_birth || "",
        joined_club: data.joined_club || "",
        status: data.status || "",
      });
    });

    if (querySnapshot.docs.length > 0) {
      lastDocumentSnapshot = querySnapshot.docs[querySnapshot.docs.length - 1]; // Update lastDocumentSnapshot. Set it to the last doc of the snapshot
      firstDocumentSnapshot = querySnapshot.docs[0]; //update firstDocumentSnapshot to be the first doc in the snapshot
    } else {
      lastDocumentSnapshot = null; // No more documents
      firstDocumentSnapshot = null;
    }
    return players;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch players data");
  }
}

export async function getPlayer(id: string) {
  try {
    const docRef = doc(db, "players", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Players;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch player data");
  }
}
