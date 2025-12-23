import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../prisma';

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

  try {
    // Если передан id, возвращаем конкретную запись
    if (id) {
      const post = await prisma.posts.findUnique({
        where: { id: parseInt(id) },
        include: { posts2: { select: { id: true, name: true } } },
      });
      return NextResponse.json(post);
    }

    // Если передан slug, возвращаем по slug
    if (slug) {
      const whereCondition = isNumericId(slug)
        ? { OR: [{ slug }, { id: parseInt(slug) }] }
        : { slug };

      const post = await prisma.posts.findFirst({
        where: whereCondition,
        select: { id: true, name: true, slug: true },
      });
      return NextResponse.json(post);
    }

    // Если ничего не передано, возвращаем все записи
    const posts = await prisma.posts.findMany({
      include: {
        _count: {
          select: { posts2: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Ошибка при получении постов:', error);
    return NextResponse.json({ error: 'Ошибка при получении постов' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, description, image, category } = body;

    if (!name) {
      return NextResponse.json({ error: 'Название обязательно' }, { status: 400 });
    }

    const finalSlug = slug || generateSlug(name);

    const post = await prisma.posts.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
        category,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    console.error('Ошибка при создании поста:', error);
    const prismaError = error as { code?: string; message?: string };
    if (prismaError.code === 'P2002') {
      return NextResponse.json({ error: 'Пост с таким slug уже существует' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка при создании поста' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, slug, description, image, category } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID обязателен' }, { status: 400 });
    }

    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
      image?: string | null;
      category?: string | null;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (category !== undefined) updateData.category = category;
    if (slug !== undefined) {
      updateData.slug = slug || (name ? generateSlug(name) : undefined);
    }

    const post = await prisma.posts.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error('Ошибка при обновлении поста:', error);
    const prismaError = error as { code?: string; message?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Пост не найден' }, { status: 404 });
    }
    if (prismaError.code === 'P2002') {
      return NextResponse.json({ error: 'Пост с таким slug уже существует' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка при обновлении поста' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID обязателен' }, { status: 400 });
    }

    await prisma.posts.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Ошибка при удалении поста:', error);
    const prismaError = error as { code?: string; message?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Пост не найден' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Ошибка при удалении поста' }, { status: 500 });
  }
}
