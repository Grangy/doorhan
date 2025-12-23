import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../prisma';

interface PhotoData {
  image: string;
  name: string;
  posts2Id: string;
  order: number | string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const posts2Id = searchParams.get('posts2Id');

  try {
    const photos = await prisma.sliderPhotos.findMany({
      where: posts2Id ? { posts2Id: parseInt(posts2Id) } : {},
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(photos);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PhotoData[];

    // Создаем записи по одной, чтобы получить полные объекты
    const createdPhotos = await Promise.all(
      body.map(async (photo: PhotoData) => {
        return await prisma.sliderPhotos.create({
          data: {
            image: photo.image,
            name: photo.name,
            posts2Id: parseInt(photo.posts2Id),
            order: Number(photo.order),
          },
        });
      })
    );

    return NextResponse.json(createdPhotos);
  } catch (error: unknown) {
    console.error('Error creating photos:', error);
    return NextResponse.json({ error: 'Failed to create photos' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, order } = body;

    if (!id || order === undefined) {
      return NextResponse.json({ error: 'Missing id or order' }, { status: 400 });
    }

    const updatedPhoto = await prisma.sliderPhotos.update({
      where: { id: parseInt(id) },
      data: { order: Number(order) },
    });

    return NextResponse.json(updatedPhoto);
  } catch (error: unknown) {
    console.error('Error updating photo:', error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    await prisma.sliderPhotos.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
