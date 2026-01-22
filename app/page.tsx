import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center p-8">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-medium mb-4">ENS Social</h1>
        <p className="text-lg text-gray-600 mb-12">
          Explore ENS profiles and visualize social connections on the
          blockchain.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/search"
            className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
          >
            Search ENS
          </Link>
          <Link
            href="/graph"
            className="px-6 py-3 border border-black font-medium hover:bg-gray-100 transition-colors"
          >
            View Graph
          </Link>
        </div>
      </div>
    </main>
  );
}
