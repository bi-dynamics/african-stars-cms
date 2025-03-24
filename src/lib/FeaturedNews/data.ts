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
  doc,
  getDoc,
} from "firebase/firestore";

import { FeaturedNews } from "./definitions";

let lastDocumentSnapshot: DocumentSnapshot | null = null; //stores the last document fetched from previous query
let firstDocumentSnapshot: DocumentSnapshot | null = null; //stores the first document of the current page

export async function getFeaturedNews(
  nextPage: boolean = false,
  prevPage: boolean = false
): Promise<FeaturedNews[]> {
  const ref = collection(db, "featured_news");
  let q = query(ref, orderBy("datePosted", "desc"), limit(5));

  if (nextPage && lastDocumentSnapshot) {
    // If it's the next page, start after the last document of the previous page
    q = query(
      ref,
      orderBy("datePosted", "desc"),
      startAfter(lastDocumentSnapshot),
      limit(5)
    );
  }

  if (prevPage && firstDocumentSnapshot) {
    q = query(
      ref,
      orderBy("datePosted", "desc"),
      endBefore(firstDocumentSnapshot),
      limit(5)
    );
  }

  try {
    const querySnapshot = await getDocs(q);

    const featuredNews: FeaturedNews[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      featuredNews.push({
        id: doc.id,
        datePosted: data.datePosted || "",
        title: data.title || "",
        description: data.description || "",
        picture: data.picture || "",
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

    return featuredNews;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch featured news data");
  }
}

export async function getArticle(id: string) {
  try {
    const docRef = doc(db, "featured_news", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as FeaturedNews;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error("Failed to fetch news article");
  }
}
