import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const [users, friendships] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          ensName: true,
          avatar: true,
        },
      }),
      prisma.friendship.findMany({
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
      }),
    ]);

    const nodes = users.map((user) => ({
      id: user.ensName || user.id,
      label: user.ensName || "Unknown",
      image: user.avatar || undefined,
    }));

    const edges = friendships.map((friendship) => ({
      id: friendship.id,
      from: friendship.initiator.ensName,
      to: friendship.receiver.ensName,
    }));

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return NextResponse.json(
      { error: "Failed to fetch graph data" },
      { status: 500 }
    );
  }
}
