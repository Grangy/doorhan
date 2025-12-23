import { NextRequest, NextResponse } from 'next/server';
import prisma from "../../../prisma";

// Проверка, является ли строка числовым ID (для SQLite)
function isNumericId(id: string): boolean {
  return /^\d+$/.test(id);
}

// Генерация slug из названия
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');
  const postId = searchParams.get('postId');

  try {
    // Если передан id, возвращаем конкретную запись
    if (id) {
      const post2 = await prisma.posts2.findUnique({
        where: { id: parseInt(id) },
        include: {
          post: { select: { id: true, name: true } },
        },
      });
      return NextResponse.json(post2);
    }

    // Если передан postId, возвращаем все товары категории
    if (postId) {
      const posts2 = await prisma.posts2.findMany({
        where: { postId: parseInt(postId) },
        include: {
          post: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(posts2);
    }

    // Если задан параметр slug, возвращаем одну запись
    if (slug) {
      const whereCondition = isNumericId(slug)
        ? { OR: [{ slug }, { id: parseInt(slug) }] }
        : { slug };

      const post2 = await prisma.posts2.findFirst({
        where: whereCondition,
        select: { id: true, name: true, slug: true },
      });
      return NextResponse.json(post2);
    }

    // Если ничего не передано, возвращаем все записи
    const posts2 = await prisma.posts2.findMany({
      include: {
        post: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts2);
  } catch (error) {
    console.error('Ошибка при получении постов:', error);
    return NextResponse.json({ error: 'Ошибка при получении постов' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, description, content, metadata, specs, image, postId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Название обязательно' }, { status: 400 });
    }

    const finalSlug = slug || generateSlug(name);

    const post2 = await prisma.posts2.create({
      data: {
        name,
        slug: finalSlug,
        description,
        content,
        metadata,
        specs: specs ? JSON.parse(JSON.stringify(specs)) : undefined,
        image,
        postId: postId ? parseInt(postId) : undefined,
      },
      include: {
        post: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(post2, { status: 201 });
  } catch (error: unknown) {
    console.error('Ошибка при создании товара:', error);
    const prismaError = error as { code?: string; message?: string };
    if (prismaError.code === 'P2002') {
      return NextResponse.json({ error: 'Товар с таким slug уже существует' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка при создании товара' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, slug, description, content, metadata, specs, image, postId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID обязателен' }, { status: 400 });
    }

          const updateData: Record<string, unknown> = {};
          if (name !== undefined) updateData.name = name;
          if (description !== undefined) updateData.description = description;
          if (content !== undefined) updateData.content = content;
          if (metadata !== undefined) updateData.metadata = metadata;
          if (specs !== undefined) updateData.specs = JSON.parse(JSON.stringify(specs));
          if (image !== undefined) updateData.image = image;
          if (postId !== undefined) {
            if (postId === null || postId === '') {
              updateData.postId = null;
            } else {
              updateData.postId = parseInt(postId);
            }
          }
          if (slug !== undefined) {
            updateData.slug = slug || (name ? generateSlug(name) : undefined);
          }

          const post2 = await prisma.posts2.update({
            where: { id: parseInt(id) },
            data: updateData as Parameters<typeof prisma.posts2.update>[0]['data'],
      include: {
        post: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(post2);
  } catch (error: unknown) {
    console.error('Ошибка при обновлении товара:', error);
    const prismaError = error as { code?: string; message?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }
    if (prismaError.code === 'P2002') {
      return NextResponse.json({ error: 'Товар с таким slug уже существует' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка при обновлении товара' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID обязателен' }, { status: 400 });
    }

    await prisma.posts2.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Ошибка при удалении товара:', error);
    const prismaError = error as { code?: string; message?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Ошибка при удалении товара' }, { status: 500 });
  }
}
