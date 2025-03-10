import { NextResponse } from 'next/server';
import prisma from "../../../prisma";

// Функция для проверки валидного ObjectID (24-х символьная шестнадцатеричная строка)
function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  // Если задан параметр slug, возвращаем одну запись (с выбранными полями)
  if (slug) {
    const whereCondition = isValidObjectId(slug)
      ? { OR: [{ slug }, { id: slug }] }
      : { slug };

    try {
      const post2 = await prisma.posts2.findFirst({
        where: whereCondition,
        select: { id: true, name: true, slug: true },
      });
      return NextResponse.json(post2);
    } catch (error) {
      console.error('Ошибка при получении post2 по slug:', error);
      return NextResponse.json({ error: 'Ошибка при получении post2' }, { status: 500 });
    }
  }

  // Если slug не задан, возвращаем все записи (сохраняя существующий функционал)
  try {
    const posts2 = await prisma.posts2.findMany();
    return NextResponse.json(posts2);
  } catch (error) {
    console.error('Ошибка при получении постов:', error);
    return NextResponse.json({ error: 'Ошибка при получении постов' }, { status: 500 });
  }
}
