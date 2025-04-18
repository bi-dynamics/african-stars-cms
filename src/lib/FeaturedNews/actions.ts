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
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v4 } from "uuid";
import { getErrorMessage } from "../utils";
import { updateFeaturedNewsType } from "./definitions";

export async function createFeaturedNews(formData: FormData) {
  const data = Object.fromEntries(formData);
  const { title, description, picture, status } = data;

  let imageUrl: string | undefined = undefined;

  // handle image upload
  if (picture instanceof File) {
    //Reference to location to store image
    const uniqueFileName = `${v4()}-${picture.name}`;
    const storageRef = ref(storage, `news/${uniqueFileName}`);
    await uploadBytes(storageRef, picture as Blob);
    imageUrl = await getDownloadURL(storageRef);
  }
  await addDoc(collection(db, "featured_news"), {
    title,
    description,
    picture: imageUrl ?? "",
    status: status,
    datePosted: Timestamp.now(),
  });

  revalidatePath("/dashboard/featured-news");
  redirect("/dashboard/featured-news");
}

type FeaturedNewsStatus = "active" | "draft";
export async function updateFeaturedNews(
  id: string,
  formData: FormData
): Promise<void> {
  const data = Object.fromEntries(formData);
  const title = data.title as string;
  const description = data.description as string;
  const picture = data.picture as File;
  const status = data.status as FeaturedNewsStatus;

  const updateData: updateFeaturedNewsType = {}; // Create an object to store updated fields

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
    });
  }

  revalidatePath("/dashboard/featured-news");
  redirect("/dashboard/featured-news");
}

export async function deleteFeaturedNews(id: string) {
  try {
    await deleteDoc(doc(db, "featured_news", id));
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
