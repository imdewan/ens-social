"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SearchPage() {
  const router = useRouter();
  const [ensName, setEnsName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = ensName.trim().toLowerCase();

    if (!trimmed) {
      setError("Please enter an ENS name");
      return;
    }

    if (!trimmed.endsWith(".eth")) {
      setError("ENS name must end with .eth");
      return;
    }

    router.push(`/profile/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-gray-600 hover:text-black mb-8 block">
          &larr; Back to home
        </Link>

        <h1 className="text-3xl font-medium mb-2">Search ENS</h1>
        <p className="text-gray-600 mb-8">Look up any ENS name to view their profile and records.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={ensName}
              onChange={(e) => setEnsName(e.target.value)}
              placeholder="vitalik.eth"
              className="w-full px-4 py-3 border border-black focus:outline-none focus:ring-2 focus:ring-black"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
          >
            View Profile
          </button>
        </form>
      </div>
    </main>
  );
}
