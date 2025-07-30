
// ⬇️ Extract this into a client component
"use client"
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/signin" })}
      className="bg-teal-600 hover:bg-black text-white font-bold py-2 px-4 rounded"
    >
      Sign Out
    </button>
  );
}

