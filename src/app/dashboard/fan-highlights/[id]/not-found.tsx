import { Frown } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <Frown className="w-10 h-10 text-red-400" />
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>Could not find the requested fan highlight.</p>
      <Link
        href="/dashboard/fan-highlights/"
        className="mt-4 rounded-md bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-black"
      >
        Go Back
      </Link>
    </main>
  );
}
