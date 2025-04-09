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
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getErrorMessage } from "../utils";
import { updateFanHighlightsType } from "./definitions";

export async function createFanHighlights(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const { src, status } = data;

    //Replace "watch?v=" with "embed" in the src URL
    //and handle the case where a link is already in embedded form
    const videoURL = src.toString();

    let videoId;
    let embedSrc = videoURL;
    if (videoURL.includes("watch?v=")) {
      videoId = videoURL.split("watch?v=")[1].split("&t=")[0];
      embedSrc = `https://www.youtube.com/embed/${videoId}`;
    }

    await addDoc(collection(db, "fan_highlights"), {
      src: embedSrc,
      status,
      date_posted: Timestamp.now(),
    });
  } catch (error) {
    throw error;
  }
  revalidatePath("/dashboard/fan-highlights");
  redirect("/dashboard/fan-highlights");
}

type FanHighlightsStatus = "active" | "draft";
export async function updateFanHighlights(
  id: string,
  formData: FormData
): Promise<void> {
  try {
    const data = Object.fromEntries(formData);
    const status = data.status as FanHighlightsStatus;
    const src = data.src as string;

    const updateData: updateFanHighlightsType = {}; // Create an object to store updated fields

    if (src) {
      //Replace "watch?v=" with "embed" in the src URL
      //and handle the case where a link is already in embedded form
      const videoURL = src.toString();
      console.log(videoURL);

      let videoId;
      let embedSrc = videoURL;
      if (videoURL.includes("watch?v=")) {
        videoId = videoURL.split("watch?v=")[1].split("&t=")[0];
        embedSrc = `https://www.youtube.com/embed/${videoId}`;
      }
      updateData.src = embedSrc;
    }

    if (status) {
      updateData.status = status;
    }

    if (Object.keys(updateData).length > 0) {
      // Only update if there are changes
      await updateDoc(doc(db, "fan_highlights", id), {
        ...updateData,
      });
    }
  } catch (error) {
    throw error;
  }
  revalidatePath("/dashboard/fan-highlights");
  redirect("/dashboard/fan-highlights");
}

export async function deleteFanHighlight(id: string) {
  try {
    await deleteDoc(doc(db, "fan_highlights", id));
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
