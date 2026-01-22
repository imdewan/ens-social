"use client";

import { Network, Options, Node, Edge } from "vis-network";
import { DataSet } from "vis-data";

export interface GraphNode {
  id: string;
  label: string;
  image?: string;
}

export interface GraphEdge {
  id?: string;
  from: string;
  to: string;
}

export const defaultNetworkOptions: Options = {
  nodes: {
    shape: "circularImage",
    size: 30,
    font: {
      size: 14,
      color: "#333",
    },
    borderWidth: 2,
    shadow: true,
  },
  edges: {
    width: 2,
    color: { color: "#848484", highlight: "#1a73e8" },
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
  },
};

export function createNetwork(
  container: HTMLElement,
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: Options = defaultNetworkOptions,
): Network {
  const nodesDataSet = new DataSet<Node>(nodes as Node[]);
  const edgesWithIds = edges.map((edge, index) => ({
    ...edge,
    id: edge.id ?? `edge-${index}`,
  }));
  const edgesDataSet = new DataSet<Edge>(edgesWithIds as Edge[]);

  return new Network(
    container,
    { nodes: nodesDataSet, edges: edgesDataSet },
    options,
  );
}
