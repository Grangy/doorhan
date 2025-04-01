// app/api/search/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma"; // убедитесь, что путь корректный

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  
  if (!query) return NextResponse.json({ results: [] });

  const results = await prisma.posts2.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10, // ограничиваем число результатов
  });

  return NextResponse.json({ results });
}
