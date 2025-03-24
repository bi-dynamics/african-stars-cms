import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { Teams } from "./definitions";
import { db } from "@/app/firebase/config";

export async function getTeams(): Promise<Teams[]> {
  const ref = collection(db, "teams");
  const q = query(ref, orderBy("name", "asc"));

  try {
    const querySnapshot = await getDocs(q);

    const teams: Teams[] = [];
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch teams");
  }
}

export async function getTeam(id: string) {
  try {
    const docRef = doc(db, "teams", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Teams;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error("Failed to fetch team");
  }
}
