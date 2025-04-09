"use server";

import { storage, db } from "@/app/firebase/config";
import {
  addDoc,
  collection,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v4 } from "uuid";
import { getErrorMessage } from "../utils";
import { updateTeamsType } from "./definitions";

export async function createTeam(formData: FormData): Promise<void> {
  const data = Object.fromEntries(formData);
  const { name, image } = data;

  let imageUrl: string | undefined = undefined;

  //handle image upload
  if (image instanceof File) {
    const uniqueFileName = `${v4()}-${image.name}`;
    const storageRef = ref(storage, `teams/${uniqueFileName}`);
    await uploadBytes(storageRef, image as Blob);
    imageUrl = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "teams"), {
    name,
    image_url: imageUrl ?? "",
  });

  revalidatePath("/dashboard/teams");
  redirect("/dashboard/teams");
}

export async function updateTeam(
  id: string,
  formData: FormData
): Promise<void> {
  const data = Object.fromEntries(formData);
  const name = data.name as string;
  const image = data.image as File;

  const updateData: updateTeamsType = {};

  if (name) {
    updateData.name = name;
  }

  if (image && image instanceof File) {
    const uniqueFileName = `${v4()}-${image.name}`;
    const storageRef = ref(storage, `teams/${uniqueFileName}`);
    await uploadBytes(storageRef, image as Blob);
    updateData.image_url = await getDownloadURL(storageRef);
  }

  if (Object.keys(updateData).length > 0) {
    // Only update if there are changes
    await updateDoc(doc(db, "teams", id), {
      ...updateData,
    });
  }

  revalidatePath("/dashboard/teams");
  redirect("/dashboard/teams");
}

export async function deleteTeam(id: string) {
  try {
    await deleteDoc(doc(db, "teams", id));
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
