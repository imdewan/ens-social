"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Network, Options, Node, Edge } from "vis-network";
import { DataSet } from "vis-data";

interface GraphNode {
  id: string;
  label: string;
  image?: string;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const networkOptions: Options = {
  nodes: {
    shape: "dot",
    size: 20,
    font: {
      size: 14,
      color: "#000",
    },
    color: {
      border: "#000",
      background: "#fff",
      highlight: {
        border: "#000",
        background: "#e5e5e5",
      },
      hover: {
        border: "#000",
        background: "#f5f5f5",
      },
    },
    borderWidth: 2,
  },
  edges: {
    width: 1,
    color: { color: "#000", highlight: "#000", hover: "#666" },
  },
  physics: {
    stabilization: { iterations: 100 },
    barnesHut: {
      gravitationalConstant: -3000,
      springConstant: 0.04,
    },
  },
  interaction: {
    hover: true,
    tooltipDelay: 200,
    multiselect: true,
  },
};

export default function GraphPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

  const [ensFrom, setEnsFrom] = useState("");
  const [ensTo, setEnsTo] = useState("");

  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/graph");
      if (!response.ok) {
        throw new Error("Failed to fetch graph data");
      }
      const data: GraphData = await response.json();
      setGraphData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const friendshipExists = useCallback(
    (from: string, to: string): boolean => {
      if (!graphData) return false;
      return graphData.edges.some(
        (e) =>
          (e.from === from && e.to === to) || (e.from === to && e.to === from),
      );
    },
    [graphData],
  );

  const createFriendship = useCallback(
    async (from: string, to: string, skipConfirm = false) => {
      const trimmedFrom = from.trim().toLowerCase();
      const trimmedTo = to.trim().toLowerCase();

      if (!trimmedFrom || !trimmedTo) {
        setError("Both ENS names are required");
        return;
      }

      if (!trimmedFrom.endsWith(".eth") || !trimmedTo.endsWith(".eth")) {
        setError("Both names must end with .eth");
        return;
      }

      if (trimmedFrom === trimmedTo) {
        setError("Cannot create friendship with self");
        return;
      }

      if (friendshipExists(trimmedFrom, trimmedTo)) {
        setError("Friendship already exists between these users");
        return;
      }

      if (!skipConfirm) {
        const confirmed = confirm(
          `Create friendship between ${trimmedFrom} and ${trimmedTo}?`,
        );
        if (!confirmed) return;
      }

      setActionLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/friendship", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initiator: trimmedFrom, receiver: trimmedTo }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create friendship");
        }

        setSelectedNode(null);
        setEnsFrom("");
        setEnsTo("");
        await fetchGraphData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setActionLoading(false);
      }
    },
    [friendshipExists, fetchGraphData],
  );

  const deleteFriendship = useCallback(
    async (from: string, to: string, skipConfirm = false) => {
      if (!skipConfirm) {
        const confirmed = confirm(
          `Delete friendship between ${from} and ${to}?`,
        );
        if (!confirmed) return;
      }

      setActionLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/friendship", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initiator: from, receiver: to }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to delete friendship");
        }

        setSelectedEdge(null);
        await fetchGraphData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchGraphData],
  );

  const deleteUser = useCallback(
    async (ensName: string) => {
      const confirmed = confirm(
        `Delete user ${ensName}? This will also delete all their friendships.`,
      );
      if (!confirmed) return;

      setActionLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/user", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ensName }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to delete user");
        }

        setSelectedNode(null);
        await fetchGraphData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setActionLoading(false);
      }
    },
    [fetchGraphData],
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFriendship(ensFrom, ensTo, true);
  };

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedEdge(null);
    setSelectedNode((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const handleEdgeClick = useCallback(
    (edgeId: string) => {
      if (!graphData) return;
      setSelectedNode(null);
      const edge = graphData.edges.find((e) => e.id === edgeId);
      setSelectedEdge(edge || null);
    },
    [graphData],
  );

  const handleConnectWithSelected = () => {
    if (!selectedNode) return;
    const other = prompt("Enter ENS name to connect with:");
    if (other && other.trim()) {
      createFriendship(selectedNode, other.trim(), true);
    }
  };

  const renderGraph = useCallback(
    (data: GraphData) => {
      if (!containerRef.current) return;

      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }

      if (data.nodes.length === 0) return;

      const nodesDataSet = new DataSet<Node>(data.nodes as Node[]);
      const edgesDataSet = new DataSet<Edge>(data.edges as Edge[]);

      const network = new Network(
        containerRef.current,
        { nodes: nodesDataSet, edges: edgesDataSet },
        networkOptions,
      );

      network.on("click", (params) => {
        if (params.nodes.length > 0) {
          handleNodeClick(params.nodes[0] as string);
        } else if (params.edges.length > 0) {
          handleEdgeClick(params.edges[0] as string);
        } else {
          setSelectedNode(null);
          setSelectedEdge(null);
        }
      });

      networkRef.current = network;
    },
    [handleNodeClick, handleEdgeClick],
  );

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  useEffect(() => {
    if (graphData) {
      renderGraph(graphData);
    }
  }, [graphData, renderGraph]);

  useEffect(() => {
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, []);

  const hasNodes = graphData && graphData.nodes.length > 0;

  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-medium">ENS Graph</h1>
          <button
            onClick={fetchGraphData}
            disabled={loading}
            className="px-4 py-2 border border-black font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-600 text-red-600">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6 p-4 border border-black">
          <h2 className="font-medium mb-3">Add Friendship</h2>
          <form onSubmit={handleFormSubmit} className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={ensFrom}
              onChange={(e) => setEnsFrom(e.target.value)}
              placeholder="alice.eth"
              className="flex-1 min-w-[150px] px-3 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="text"
              value={ensTo}
              onChange={(e) => setEnsTo(e.target.value)}
              placeholder="bob.eth"
              className="flex-1 min-w-[150px] px-3 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={actionLoading || !ensFrom || !ensTo}
              className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {actionLoading ? "Adding..." : "Add"}
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-600">
            Users are created automatically. Existing users will be linked
            without duplicates.
          </p>
        </div>

        {selectedNode && (
          <div className="mb-6 p-4 border border-black flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="font-medium">Selected node: </span>
              {selectedNode}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() =>
                  router.push(`/profile/${encodeURIComponent(selectedNode)}`)
                }
                className="px-3 py-1 border border-black hover:bg-gray-100"
              >
                View Profile
              </button>
              <button
                onClick={handleConnectWithSelected}
                disabled={actionLoading}
                className="px-3 py-1 border border-black hover:bg-gray-100 disabled:opacity-50"
              >
                Connect to...
              </button>
              <button
                onClick={() => deleteUser(selectedNode)}
                disabled={actionLoading}
                className="px-3 py-1 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete Node"}
              </button>
              <button
                onClick={() => setSelectedNode(null)}
                className="px-3 py-1 border border-black hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {selectedEdge && (
          <div className="mb-6 p-4 border border-black flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="font-medium">Selected edge: </span>
              {selectedEdge.from} — {selectedEdge.to}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedEdge(null)}
                className="px-3 py-1 border border-black hover:bg-gray-100"
              >
                Clear
              </button>
              <button
                onClick={() =>
                  deleteFriendship(selectedEdge.from, selectedEdge.to, true)
                }
                disabled={actionLoading}
                className="px-3 py-1 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete Edge"}
              </button>
            </div>
          </div>
        )}

        {!loading && !hasNodes && (
          <div className="text-center py-12 text-gray-600 border border-dashed border-gray-300">
            <p className="mb-2">No friendships yet.</p>
            <p className="text-sm">
              Use the form above to add your first friendship.
            </p>
          </div>
        )}

        <div
          ref={containerRef}
          className={`w-full border border-black ${hasNodes ? "h-[500px]" : "h-0 border-0"}`}
        />

        {hasNodes && (
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <p>
              Click a node to select it. Then view profile, connect to another
              user, or delete it.
            </p>
            <p>Click an edge to select and delete it.</p>
          </div>
        )}
      </div>
    </main>
  );
}
