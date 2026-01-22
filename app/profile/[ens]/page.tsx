import {
  resolveENSName,
  getAllTextRecords,
  getENSAvatar,
} from "@/lib/ens/resolver";

interface ProfilePageProps {
  params: Promise<{ ens: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { ens } = await params;
  const ensName = decodeURIComponent(ens);

  const [address, textRecords, avatar] = await Promise.all([
    resolveENSName(ensName),
    getAllTextRecords(ensName),
    getENSAvatar(ensName),
  ]);

  if (!address) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-2">ENS not found</h1>
          <p className="text-gray-600">
            {ensName} does not resolve to an address
          </p>
        </div>
      </main>
    );
  }

  const recordEntries = Object.entries(textRecords);

  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="max-w-2xl mx-auto">
        <div className="border-b border-black pb-6 mb-6">
          {avatar && (
            <img
              src={avatar}
              alt={ensName}
              className="w-24 h-24 rounded-full mb-4 border border-black"
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
