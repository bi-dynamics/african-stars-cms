import { db } from "@/app/firebase/config";
import {
  addDoc,
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
  Timestamp,
  updateDoc,
} from "firebase/firestore";

export interface FanHighlightsData {
  id: string;
  date_posted: Timestamp;
  src: string;
  status: string;
}

let lastDocumentSnapshot: DocumentSnapshot | null = null; //stores the last document fetched from previous query
let firstDocumentSnapshot: DocumentSnapshot | null = null; //stores the first document of the current page

export async function getFanHighlights(
  nextPage: boolean = false,
  prevPage: boolean = false
): Promise<FanHighlightsData[]> {
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

    const fanHighlights: FanHighlightsData[] = [];
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
    throw error;
  }
}

export async function createFanHighlights(formData: FormData): Promise<void> {
  try {
    const data = Object.fromEntries(formData);
    const { src, status } = data;

    //Replace "watch?v=" with "embed" in the src URL
    const videoURL = src.toString();
    const videoId = videoURL.split("watch?v=")[1].split("&t=")[0];
    const embedSrc = `https://www.youtube.com/embed/${videoId}`;

    await addDoc(collection(db, "fan_highlights"), {
      src: embedSrc,
      status,
      date_posted: Timestamp.now(),
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateFanHighlights(
  id: string,
  formData: FormData
): Promise<void> {
  try {
    const data = Object.fromEntries(formData);
    const { src, status } = data;

    const updateData: any = {}; // Create an object to store updated fields

    if (src) {
      //Replace "watch?v=" with "embed" in the src URL
      const videoURL = src.toString();
      const videoId = videoURL.split("watch?v=")[1].split("&t=")[0];

      const embedSrc = `https://www.youtube.com/embed/${videoId}`;
      updateData.src = embedSrc;
    }

    if (status) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length > 0) {
      // Only update if there are changes
      await updateDoc(doc(db, "fan_highlights", id), {
        ...updateData,
        datePosted: Timestamp.now(),
      });
    }

    console.log("doc updated");
  } catch (error) {
    console.error(error);
    throw error; //gets handles by the caller
  }
}

export async function getFanHighlight(id: string) {
  try {
    const docRef = doc(db, "fan_highlights", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.error("document does not exist"); // Handle case where document doesn't exist
      return null;
    }
  } catch (error) {
    console.error("Error fetching article:", error);
    throw error;
  }
}
