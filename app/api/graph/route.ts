/**
 * Graph API route.
 * GET: Returns all users as nodes and friendships as edges
 * for vis-network visualization.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        ensName: true,
        avatar: true,
      },
    });

    const friendships = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
      },
      select: {
        id: true,
        initiator: {
          select: { ensName: true },
        },
        receiver: {
          select: { ensName: true },
        },
      },
    });

    // Format for vis-network: nodes need id and label
    const nodes = users.map(
      (user: {
        id: string;
        ensName: string | null;
        avatar: string | null;
      }) => ({
        id: user.ensName || user.id,
        label: user.ensName || "Unknown",
        image: user.avatar || undefined,
      }),
    );

    // Format for vis-network: edges need id, from, and to
    const edges = friendships.map(
      (friendship: {
        id: string;
        initiator: { ensName: string | null };
        receiver: { ensName: string | null };
      }) => ({
        id: friendship.id,
        from: friendship.initiator.ensName,
        to: friendship.receiver.ensName,
      }),
    );

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return NextResponse.json(
      { error: "Failed to fetch graph data" },
      { status: 500 },
    );
  }
}
