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
import { getErrorMessage } from "../utils";
import { updatePlayers } from "./definitions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPlayer(formData: FormData) {
  const data = Object.fromEntries(formData);
  const {
    id,
    firstName,
    lastName,
    number,
    picture,
    detail_picture,
    position,
    current_age,
    height,
    foot,
    biography,
    nationality,
    date_of_birth,
    joined_club,
    status,
  } = data;

  let pictureDownloadUrl: string | undefined = undefined;
  let detailPictureDownloadUrl: string | undefined = undefined;

  if (picture instanceof File) {
    //Reference to location to store image
    const storageRef = ref(storage, `players/${id}/images/cover`);
    await uploadBytes(storageRef, picture as Blob);
    pictureDownloadUrl = await getDownloadURL(storageRef);
  }

  if (detail_picture instanceof File) {
    //Reference to location to store image
    const storageRef = ref(storage, `players/${id}/images/detail`);
    await uploadBytes(storageRef, detail_picture as Blob);
    detailPictureDownloadUrl = await getDownloadURL(storageRef);
  }

  let timestampDateOfBirth: Timestamp | undefined = undefined;
  if (date_of_birth) {
    //Convert date_of_birth to Timestamp
    timestampDateOfBirth = Timestamp.fromDate(
      new Date(date_of_birth.toString())
    );
  }

  let timestampJoinedClub: Timestamp | undefined = undefined;
  if (joined_club) {
    //Convert joined_club to Timestamp
    timestampJoinedClub = Timestamp.fromDate(new Date(joined_club.toString()));
  }

  await addDoc(collection(db, "players"), {
    firstName,
    lastName,
    number: number ? parseInt(number.toString()) : 0,
    position,
    picture: pictureDownloadUrl ?? "",
    detail_picture: detailPictureDownloadUrl ?? "",
    current_age: current_age ? parseInt(current_age.toString()) : 0,
    height: height ? parseInt(height.toString()) : 0,
    foot,
    biography: biography ?? "",
    nationality: nationality ?? "",
    date_of_birth: timestampDateOfBirth,
    joined_club: timestampJoinedClub,
    status,
  });

  revalidatePath("/dashboard/players");
  redirect("/dashboard/players");
}

type PositionOptions = "Midfielder" | "Forward" | "Defender" | "Goalkeeper";

type FootOptions = "left" | "right";

type PlayersStatus = "active" | "draft";

export async function updatePlayer(id: string, formData: FormData) {
  const data = Object.fromEntries(formData);
  const {
    firstName,
    lastName,
    number,
    picture,
    detail_picture,
    position,
    current_age,
    height,
    foot,
    biography,
    nationality,
    date_of_birth,
    joined_club,
    status,
  } = data;

  const updatePlayer: updatePlayers = {};
  let pictureDownloadUrl: string | undefined = undefined;
  let detailPictureDownloadUrl: string | undefined = undefined;

  if (firstName) {
    updatePlayer.firstName = firstName as string;
  }
  if (lastName) {
    updatePlayer.lastName = lastName as string;
  }
  if (number) {
    updatePlayer.number = parseInt(number.toString());
  }
  if (picture instanceof File) {
    //Reference to location to store image
    const storageRef = ref(storage, `players/${id}/images/cover`);
    await uploadBytes(storageRef, picture as Blob);
    pictureDownloadUrl = await getDownloadURL(storageRef);
    updatePlayer.picture = pictureDownloadUrl;
  }

  if (detail_picture instanceof File) {
    //Reference to location to store image
    const storageRef = ref(storage, `players/${id}/images/detail`);
    await uploadBytes(storageRef, detail_picture as Blob);
    detailPictureDownloadUrl = await getDownloadURL(storageRef);
    updatePlayer.detail_picture = detailPictureDownloadUrl;
  }
  if (position) {
    updatePlayer.position = position as PositionOptions;
  }
  if (current_age) {
    updatePlayer.current_age = parseInt(current_age.toString());
  }
  if (height) {
    updatePlayer.height = parseInt(height.toString());
  }
  if (foot) {
    updatePlayer.foot = foot as FootOptions;
  }
  if (nationality) {
    updatePlayer.nationality = nationality as string;
  }
  if (biography) {
    updatePlayer.biography = biography as string;
  }
  if (date_of_birth) {
    //Convert date_of_birth to Timestamp
    const timestampDateOfBirth = Timestamp.fromDate(
      new Date(date_of_birth.toString())
    );
    updatePlayer.date_of_birth = timestampDateOfBirth;
  }

  if (joined_club) {
    //Convert joined_club to Timestamp
    const timestampJoinedClub = Timestamp.fromDate(
      new Date(joined_club.toString())
    );
    updatePlayer.joined_club = timestampJoinedClub;
  }
  if (status) {
    updatePlayer.status = status as PlayersStatus;
  }

  if (Object.keys(updatePlayer).length > 0) {
    // Only update if there are changes
    await updateDoc(doc(db, "players", id), {
      ...updatePlayer,
    });
  }

  revalidatePath("/dashboard/players");
  redirect("/dashboard/players");
}

export async function deletePlayer(id: string) {
  try {
    await deleteDoc(doc(db, "players", id));
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
