import { NextResponse } from 'next/server';
import prisma from '../../../prisma';

interface AdvantageInput {
  image: string;
  text: string;
  order: number;
  posts2Ids: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  try {
    const advantages = await prisma.advantage.findMany({
      include: {
        advantagePosts: {
          select: { posts2Id: true },
        },
      },
      orderBy: { order: 'asc' },
    });
    const transformed = advantages.map((adv) => ({
      ...adv,
      posts2Ids: adv.advantagePosts.map((ap) => ap.posts2Id),
    }));
    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching advantages:', error);
    return NextResponse.json({ error: 'Failed to fetch advantages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const advantages = (await request.json()) as AdvantageInput[];
    const createdAdvantages = await Promise.all(
      advantages.map(async (adv) => {
        const created = await prisma.advantage.create({
          data: {
            image: adv.image,
            text: adv.text,
            order: Number(adv.order),
            advantagePosts: {
              create: adv.posts2Ids.map((pid) => ({
                posts2: { connect: { id: pid } },
              })),
            },
          },
          include: {
            advantagePosts: {
              select: { posts2Id: true },
            },
          },
        });
        return {
          ...created,
          posts2Ids: created.advantagePosts.map((ap) => ap.posts2Id),
        };
      })
    );
    return NextResponse.json(createdAdvantages);
  } catch (error: unknown) {
    console.error('Error creating advantages:', error);
    return NextResponse.json({ error: 'Failed to create advantages' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const adv = await request.json();
    const { id, image, text, posts2Ids, order } = adv;
    if (!id) {
      return NextResponse.json({ error: 'Missing advantage id' }, { status: 400 });
    }
    // Обновляем преимущество (результат не сохраняется, так как не используется)
    await prisma.advantage.update({
      where: { id },
      data: {
        image,
        text,
        order: order !== undefined ? Number(order) : undefined,
      },
      include: {
        advantagePosts: {
          select: { posts2Id: true },
        },
      },
    });
    // Обновляем связи: сначала удаляем старые, потом создаём новые
    await prisma.advantagePosts2.deleteMany({
      where: { advantageId: id },
    });
    await prisma.advantage.update({
      where: { id },
      data: {
        advantagePosts: {
          create: posts2Ids.map((pid: string) => ({
            posts2: { connect: { id: pid } },
          })),
        },
      },
    });
    // Получаем обновлённое преимущество
    const finalAdvantage = await prisma.advantage.findUnique({
      where: { id },
      include: { advantagePosts: { select: { posts2Id: true } } },
    });
    return NextResponse.json({
      ...finalAdvantage,
      posts2Ids: finalAdvantage?.advantagePosts.map((ap) => ap.posts2Id) || [],
    });
  } catch (error) {
    console.error('Error updating advantage:', error);
    return NextResponse.json({ error: 'Failed to update advantage' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing advantage id' }, { status: 400 });
    }
    await prisma.advantagePosts2.deleteMany({
      where: { advantageId: id },
    });
    await prisma.advantage.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Advantage deleted successfully' });
  } catch (error) {
    console.error('Error deleting advantage:', error);
    return NextResponse.json({ error: 'Failed to delete advantage' }, { status: 500 });
  }
}
