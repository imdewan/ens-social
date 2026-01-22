/**
 * Friendship API routes.
 * POST: Create a friendship between two ENS names (validates ENS on-chain first).
 * DELETE: Remove an existing friendship.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveENSName } from "@/lib/ens/resolver";

interface FriendshipRequest {
  initiator: string;
  receiver: string;
}

/**
 * Find existing user or create new one after validating ENS resolves on-chain.
 * Throws if ENS name doesn't resolve to an address.
 */
async function validateAndGetOrCreateUser(ensName: string) {
  const existing = await prisma.user.findUnique({
    where: { ensName },
  });

  if (existing) return existing;

  // Validate ENS resolves before creating user
  const address = await resolveENSName(ensName);

  if (!address) {
    throw new Error(`ENS name "${ensName}" does not resolve to an address`);
  }

  return prisma.user.create({
    data: {
      ensName,
      address,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: FriendshipRequest = await request.json();

    // Normalize to lowercase for consistent storage
    const initiator = body.initiator?.trim().toLowerCase();
    const receiver = body.receiver?.trim().toLowerCase();

    if (!initiator || !receiver) {
      return NextResponse.json(
        { error: "Both initiator and receiver ENS names are required" },
        { status: 400 },
      );
    }

    if (!initiator.endsWith(".eth") || !receiver.endsWith(".eth")) {
      return NextResponse.json(
        { error: "Both names must be valid ENS names ending with .eth" },
        { status: 400 },
      );
    }

    if (initiator === receiver) {
      return NextResponse.json(
        { error: "Cannot create friendship with self" },
        { status: 400 },
      );
    }

    // Validate and get/create users
    let initiatorUser, receiverUser;
    try {
      [initiatorUser, receiverUser] = await Promise.all([
        validateAndGetOrCreateUser(initiator),
        validateAndGetOrCreateUser(receiver),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid ENS name";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Check for existing friendship in either direction
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: initiatorUser.id, receiverId: receiverUser.id },
          { initiatorId: receiverUser.id, receiverId: initiatorUser.id },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: "Friendship already exists" },
        { status: 409 },
      );
    }

    const friendship = await prisma.friendship.create({
      data: {
        initiatorId: initiatorUser.id,
        receiverId: receiverUser.id,
        status: "ACCEPTED",
      },
      include: {
        initiator: true,
        receiver: true,
      },
    });

    return NextResponse.json({
      id: friendship.id,
      initiator: friendship.initiator.ensName,
      receiver: friendship.receiver.ensName,
      status: friendship.status,
      createdAt: friendship.createdAt,
    });
  } catch (error) {
    console.error("Error creating friendship:", error);
    return NextResponse.json(
      { error: "Failed to create friendship" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body: FriendshipRequest = await request.json();

    // Normalize to lowercase for lookup
    const initiator = body.initiator?.trim().toLowerCase();
    const receiver = body.receiver?.trim().toLowerCase();

    if (!initiator || !receiver) {
      return NextResponse.json(
        { error: "Both initiator and receiver ENS names are required" },
        { status: 400 },
      );
    }

    const [initiatorUser, receiverUser] = await Promise.all([
      prisma.user.findUnique({ where: { ensName: initiator } }),
      prisma.user.findUnique({ where: { ensName: receiver } }),
    ]);

    if (!initiatorUser || !receiverUser) {
      return NextResponse.json(
        { error: "Friendship not found" },
        { status: 404 },
      );
    }

    // Find friendship in either direction
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: initiatorUser.id, receiverId: receiverUser.id },
          { initiatorId: receiverUser.id, receiverId: initiatorUser.id },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friendship not found" },
        { status: 404 },
      );
    }

    await prisma.friendship.delete({
      where: { id: friendship.id },
    });

    return NextResponse.json({
      message: "Friendship deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting friendship:", error);
    return NextResponse.json(
      { error: "Failed to delete friendship" },
      { status: 500 },
    );
  }
}
