"use server";

import { db, storage } from "@/app/firebase/config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { revalidatePath } from "next/cache";
import { v4 } from "uuid";

export async function deleteFeaturedNews(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "featured_news", id));
    console.log("Document deleted successfully");
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
  revalidatePath("/dashboard/featured-news");
}
