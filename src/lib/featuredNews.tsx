import { db, storage } from "@/app/firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentSnapshot,
  endBefore,
  getDoc,
  getDocFromCache,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";

export interface FeaturedNewsData {
  id: string;
  datePosted: Timestamp;
  title: string;
  description: string;
  picture: string;
  status: "active" | "draft";
}

let lastDocumentSnapshot: DocumentSnapshot | null = null; //stores the last document fetched from previous query
let firstDocumentSnapshot: DocumentSnapshot | null = null; //stores the first document of the current page

export async function getFeaturedNews(
  nextPage: boolean = false,
  prevPage: boolean = false
): Promise<FeaturedNewsData[]> {
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

    const featuredNews: FeaturedNewsData[] = [];
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
    console.error("Error fetching featured news:", error);
    return [];
  }
}

export async function getArticle(id: string) {
  try {
    const docRef = doc(db, "featured_news", id);
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

export async function createFeaturedNews(formData: FormData): Promise<void> {
  try {
    const data = Object.fromEntries(formData);
    const { title, description, picture, status } = data;

    let imageUrl: string | undefined = undefined;

    //handle image upload
    if (picture instanceof File) {
      //Reference to location to store image
      const storageRef = ref(storage, `news/${picture.name}`);
      await uploadBytes(storageRef, picture as Blob);
      console.log("image to upload", picture);
      imageUrl = await getDownloadURL(storageRef);
      console.log("imageURL", imageUrl);
    }

    await addDoc(collection(db, "featured_news"), {
      title,
      description,
      picture: imageUrl ?? "",
      status: status,
      datePosted: Timestamp.now(),
    });
    console.log("doc added");
  } catch (error) {
    console.error(error);
  }
}

export async function updateFeaturedNews(
  id: string,
  formData: FormData
): Promise<void> {
  try {
    const data = Object.fromEntries(formData);
    const { title, description, picture, status } = data;

    const updateData: any = {}; // Create an object to store updated fields

    if (title) {
      updateData.title = title;
    }
    if (description) {
      updateData.description = description;
    }
    if (status) {
      updateData.status = status;
    }

    if (picture instanceof File) {
      const uniqueFileName = `${v4()}-${picture.name}`;
      const storageRef = ref(storage, `news/${uniqueFileName}`);
      await uploadBytes(storageRef, picture as Blob);
      updateData.picture = await getDownloadURL(storageRef);
    }

    if (Object.keys(updateData).length > 0) {
      // Only update if there are changes
      await updateDoc(doc(db, "featured_news", id), {
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
