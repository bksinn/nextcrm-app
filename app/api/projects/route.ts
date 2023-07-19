import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { title, description } = body;

  if (!session) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }

  if (!title) {
    return new NextResponse("Missing project name", { status: 400 });
  }

  if (!description) {
    return new NextResponse("Missing project description", { status: 400 });
  }

  try {
    const boardsCount = await prismadb.boards.count();

    const newBoard = await prismadb.boards.create({
      data: {
        v: 0,
        user: session.user.id,
        title: title,
        description: description,
        position: boardsCount > 0 ? boardsCount : 0,
        visibility: "public",
      },
    });

    return NextResponse.json({ newBoard }, { status: 200 });
  } catch (error) {
    console.log("[NEW_BOARD_POST]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}
