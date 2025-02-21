import { db, storage } from "@/app/firebase/config";
import {
  addDoc,
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { title } from "process";
import { v4 } from "uuid";

export interface TeamsData {
  id: string;
  name: string;
  image_url: string;
}

export async function getTeams(): Promise<TeamsData[]> {
  const ref = collection(db, "teams");
  const q = query(ref, orderBy("name", "asc"));

  try {
    const querySnapshot = await getDocs(q);

    const teams: TeamsData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      teams.push({
        id: doc.id,
        name: data.name,
        image_url: data.image_url,
      });
    });
    return teams;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
}

export async function getTeam(id: string) {
  try {
    const docRef = doc(db, "teams", id);
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

export async function createTeam(formData: FormData): Promise<void> {
  try {
    const data = Object.fromEntries(formData);
    const { name, image } = data;

    let imageUrl: string | undefined = undefined;

    //handle image upload
    if (image instanceof File) {
      const uniqueFileName = `${v4()}-${image.name}`;
      const storageRef = ref(storage, `news/${uniqueFileName}`);
      await uploadBytes(storageRef, image as Blob);
      imageUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "teams"), {
      name,
      image_url: imageUrl ?? "",
    });
    console.log("doc added");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateTeam(
  id: string,
  formData: FormData
): Promise<void> {
  try {
    const data = Object.fromEntries(formData);
    const { name, image } = data;

    const updateData: any = {}; // Create an object to store updated fields

    if (name) {
      updateData.name = name;
    }

    if (image instanceof File) {
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

    console.log("doc updated");
  } catch (error) {
    console.error(error);
    throw error; //gets handles by the caller
  }
}
