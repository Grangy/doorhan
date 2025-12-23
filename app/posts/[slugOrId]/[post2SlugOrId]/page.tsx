import prisma from "../../../../prisma";
import { notFound } from "next/navigation";
import Post2DetailClient, { Post2Type, Spec } from "./Post2DetailClient";

// Объявляем тип параметров как Promise, если они асинхронные
type PageProps = {
  params: Promise<{
    postId: string;
    post2SlugOrId: string;
  }>;
};

// Проверка, является ли строка числовым ID (для SQLite)
function isNumericId(id: string): boolean {
  return /^\d+$/.test(id);
}

// Функция generateMetadata для динамической генерации метаданных
export async function generateMetadata({ params }: PageProps) {
  const { post2SlugOrId } = await params;
  const whereCondition = isNumericId(post2SlugOrId)
    ? { id: parseInt(post2SlugOrId) }
    : { slug: post2SlugOrId };

  // Получаем только необходимые поля для метаданных
  const post2 = await prisma.posts2.findFirst({
    where: whereCondition,
    select: {
      name: true,
      description: true,
    },
  });

  if (!post2) {
    return {
      title: "Not Found",
      description: "",
    };
  }

  return {
    title: post2.name,
    description: post2.description,
  };
}

export default async function Post2DetailPage({ params }: PageProps) {
  const { post2SlugOrId } = await params;

  const whereCondition = isNumericId(post2SlugOrId)
    ? { id: parseInt(post2SlugOrId) }
    : { slug: post2SlugOrId };

  const post2 = await prisma.posts2.findFirst({
    where: whereCondition,
    include: {
      post: true,
      colors: { include: { color: true } },
      sliderPhotos: true,
      pdfs: true,
      advantages: {
        include: { advantage: true },
      },
    },
  });
    
  if (!post2) return notFound();

  const specs: Spec[] = Array.isArray(post2.specs)
    ? (post2.specs as unknown as Spec[])
    : [];

  const advantages = post2.advantages.map((ap) => ap.advantage);

  const formattedPost2: Post2Type = {
    id: post2.id.toString(),
    name: post2.name,
    image: post2.image,
    description: post2.description,
    specs: specs,
    colors: (post2.colors || []).map(c => ({
      color: {
        id: c.color.id.toString(),
        name: c.color.name,
        image: c.color.image,
      }
    })),
    sliderPhotos: (post2.sliderPhotos || []).map(sp => ({
      id: sp.id.toString(),
      image: sp.image,
      name: sp.name,
      order: sp.order,
      posts2Id: sp.posts2Id.toString(),
    })),
    pdfs: (post2.pdfs || []).map(pdf => ({
      id: pdf.id.toString(),
      fileUrl: pdf.fileUrl,
      title: pdf.title,
    })),
    post: post2.post ? {
      id: post2.post.id.toString(),
      name: post2.post.name,
      slug: post2.post.slug,
      description: post2.post.description,
      image: post2.post.image,
      category: post2.post.category,
    } : undefined,
    advantages: advantages.map(a => ({
      id: a.id.toString(),
      image: a.image,
      text: a.text,
      order: a.order,
    })),
  };

  return <Post2DetailClient post2={formattedPost2} />;
}
