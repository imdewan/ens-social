/**
 * ENS Profile page - Server Component.
 * Fetches ENS data server-side for SEO and performance.
 * No "use client" needed - all data fetching happens on server.
 */

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  resolveENSName,
  getAllTextRecords,
  getENSAvatar,
} from "@/lib/ens/resolver";

interface ProfilePageProps {
  params: Promise<{ ens: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { ens } = await params;
  const ensName = decodeURIComponent(ens);
  return {
    title: ensName,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { ens } = await params;
  const ensName = decodeURIComponent(ens);

  // Fetch all ENS data in parallel for performance
  const [address, textRecords, avatar] = await Promise.all([
    resolveENSName(ensName),
    getAllTextRecords(ensName),
    getENSAvatar(ensName),
  ]);

  // Show error state if ENS doesn't resolve
  if (!address) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-2">ENS not found</h1>
          <p className="text-gray-600 mb-6">
            {ensName} does not resolve to an address
          </p>
          <Link
            href="/search"
            className="text-sm text-gray-600 hover:text-black"
          >
            &larr; Back to search
          </Link>
        </div>
      </main>
    );
  }

  const recordEntries = Object.entries(textRecords);

  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/search"
          className="text-sm text-gray-600 hover:text-black mb-6 block"
        >
          &larr; Back to search
        </Link>

        <div className="border-b border-black pb-6 mb-6">
          {avatar && (
            <Image
              src={avatar}
              alt={ensName}
              width={96}
              height={96}
              className="rounded-full mb-4 border border-black"
              unoptimized
            />
          )}
          <h1 className="text-3xl font-medium mb-2">{ensName}</h1>
          <p className="font-mono text-sm text-gray-600 break-all">{address}</p>
        </div>

        {recordEntries.length > 0 ? (
          <div>
            <h2 className="text-lg font-medium mb-4">Records</h2>
            <dl className="space-y-3">
              {recordEntries.map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 pb-3">
                  <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {key}
                  </dt>
                  <dd className="break-all">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <p className="text-gray-600">No text records found</p>
        )}
      </div>
    </main>
  );
}
