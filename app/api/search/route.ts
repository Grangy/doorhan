// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma"; // убедитесь, что путь корректный

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  
  if (!query) return NextResponse.json({ results: [] });

  const results = await prisma.posts2.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
      ],
    },
    take: 10, // ограничиваем число результатов
  });

  return NextResponse.json({ results });
}
