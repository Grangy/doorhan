import { NextResponse } from 'next/server';
import prisma from '../../../prisma';

function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) return NextResponse.json(null);

  const whereCondition = isValidObjectId(slug)
    ? { OR: [{ slug }, { id: slug }] }
    : { slug };

  const post = await prisma.posts.findFirst({
    where: whereCondition,
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json(post);
}
