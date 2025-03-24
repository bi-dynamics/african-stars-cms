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
import { FanHighlights } from "./definitions";

let lastDocumentSnapshot: DocumentSnapshot | null = null; //stores the last document fetched from previous query
let firstDocumentSnapshot: DocumentSnapshot | null = null; //stores the first document of the current page

export async function getFanHighlights(
  nextPage: boolean = false,
  prevPage: boolean = false
): Promise<FanHighlights[]> {
  const ref = collection(db, "fan_highlights");
  let q = query(ref, orderBy("date_posted", "desc"), limit(5));

  if (nextPage && lastDocumentSnapshot) {
    // If it's the next page, start after the last document of the previous page
    q = query(
      ref,
      orderBy("date_posted", "desc"),
      startAfter(lastDocumentSnapshot),
      limit(5)
    );
  }

  if (prevPage && firstDocumentSnapshot) {
    q = query(
      ref,
      orderBy("date_posted", "desc"),
      endBefore(firstDocumentSnapshot),
      limit(5)
    );
  }

  try {
    const querySnapshot = await getDocs(q);

    const fanHighlights: FanHighlights[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fanHighlights.push({
        id: doc.id,
        date_posted: data.date_posted,
        src: data.src,
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

    return fanHighlights;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch fan highlights data");
  }
}

export async function getFanHighlight(id: string) {
  try {
    const docRef = doc(db, "fan_highlights", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as FanHighlights;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error("Failed to fetch fan highlight");
  }
}
