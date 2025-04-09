"use client";
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
      <h1 className="text-3xl font-bold">Welcome, {user.displayName}</h1>
    </div>
  );
}
