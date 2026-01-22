/**
 * User API route.
 * DELETE: Remove a user and cascade delete their friendships.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface DeleteUserRequest {
  ensName: string;
}

export async function DELETE(request: NextRequest) {
  try {
    const body: DeleteUserRequest = await request.json();

    // Normalize to lowercase for lookup
    const ensName = body.ensName?.trim().toLowerCase();

    if (!ensName) {
      return NextResponse.json(
        { error: "ENS name is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { ensName },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cascade delete handled by Prisma schema (onDelete: Cascade)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
