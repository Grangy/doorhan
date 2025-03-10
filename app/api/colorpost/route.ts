import { NextResponse } from 'next/server';
import prisma from "../../../prisma";

// GET: Фильтрация по posts2Id (если передан) для получения только нужных привязок
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const posts2Id = searchParams.get("posts2Id");

    let colorPosts;
    if (posts2Id) {
      colorPosts = await prisma.colorPosts2.findMany({
        where: { posts2Id },
        include: { color: true, posts2: true },
      });
    } else {
      colorPosts = await prisma.colorPosts2.findMany({
        include: { color: true, posts2: true },
      });
    }
    return NextResponse.json(colorPosts);
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    return NextResponse.json({ error: 'Ошибка при получении данных' }, { status: 500 });
  }
}

// POST: Создание новой привязки между Color и Posts2
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { colorId, posts2Id } = body;

    const colorPost = await prisma.colorPosts2.create({
      data: { colorId, posts2Id },
    });
    return NextResponse.json(colorPost, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании связи:', error);
    return NextResponse.json({ error: 'Ошибка при создании связи' }, { status: 500 });
  }
}

// PUT: Обновление существующей привязки (например, обновление временной метки)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, colorId, posts2Id } = body;

    const colorPost = await prisma.colorPosts2.update({
      where: { id },
      data: { colorId, posts2Id },
    });
    return NextResponse.json(colorPost);
  } catch (error) {
    console.error('Ошибка при обновлении связи:', error);
    return NextResponse.json({ error: 'Ошибка при обновлении связи' }, { status: 500 });
  }
}

// DELETE: Отвязка одного цвета или всех (при наличии detachAll)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const detachAll = searchParams.get("detachAll");
    const posts2Id = searchParams.get("posts2Id");

    // Если detachAll=true, удаляем все привязки для заданного posts2Id
    if (detachAll === "true" && posts2Id) {
      const deleted = await prisma.colorPosts2.deleteMany({
        where: { posts2Id },
      });
      return new Response(JSON.stringify(deleted), { status: 200 });
    }

    const colorId = searchParams.get("colorId");
    if (!colorId || !posts2Id) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    const deleted = await prisma.colorPosts2.delete({
      where: {
        colorId_posts2Id: { colorId, posts2Id },
      },
    });
    return new Response(JSON.stringify(deleted), { status: 200 });
  } catch (error) {
    console.error('Ошибка при удалении связи:', error);
    return new Response(JSON.stringify({ error: 'Ошибка при удалении связи' }), { status: 500 });
  }
}
