/**
 * Landing page - Server Component (no "use client" needed).
 * Static page with links to search and graph features.
 */

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-medium mb-4">ENS Social</h1>
          <p className="text-lg text-gray-600 mb-12">
            Explore ENS profiles and visualize social connections on the
            blockchain.
          </p>

          <div className="flex gap-4 justify-center mb-12">
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

          <div className="text-sm text-gray-500 max-w-md mx-auto space-y-4 text-left">
            <p>
              <span className="text-black font-medium">Search ENS</span> — Look
              up any .eth name to view its wallet address, avatar, and text
              records like Twitter, GitHub, and email.
            </p>
            <p>
              <span className="text-black font-medium">View Graph</span> — An
              interactive network showing ENS identities. Create connections
              between users and visualize the social graph.
            </p>
          </div>
        </div>
      </div>

      <footer className="px-8 py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Made by <span className="text-black">Dewan Shakil Akhtar</span>
          </p>
          <a
            href="https://github.com/imdewan/ens-social"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            github.com/imdewan/ens-social
          </a>
        </div>
      </footer>
    </main>
  );
}
