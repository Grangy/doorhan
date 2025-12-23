import { NextResponse } from "next/server";
import prisma from "../../../prisma";

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Ошибка при получении блогов:", error);
    return NextResponse.json({ error: "Ошибка при получении блогов" }, { status: 500 });
  }
}

