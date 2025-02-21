"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { redirect } from "next/navigation";
export default function page() {
  const [user] = useAuthState(auth);
  if (!user) {
    redirect("/login");
  }
  return (
    <div>
      <button onClick={() => signOut(auth)}>sign out</button>
    </div>
  );
}
