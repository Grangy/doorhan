import prisma from "../../../../../prisma";
import { notFound } from "next/navigation";
import Post2DetailClient, { Post2Type, Spec } from "./Post2DetailClient";

// Объявляем тип параметров как Promise, если они асинхронные
type PageProps = {
  params: Promise<{
    postId: string;
    post2SlugOrId: string;
  }>;
};

// Функция для проверки ObjectId (если нужно)
function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Функция generateMetadata для динамической генерации метаданных
export async function generateMetadata({ params }: PageProps) {
  const { post2SlugOrId } = await params;
  const whereCondition = isValidObjectId(post2SlugOrId)
    ? { id: post2SlugOrId }
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

  const whereCondition = isValidObjectId(post2SlugOrId)
    ? { id: post2SlugOrId }
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
    id: post2.id,
    name: post2.name,
    image: post2.image,
    description: post2.description,
    specs: specs,
    colors: post2.colors || [],
    sliderPhotos: post2.sliderPhotos || [],
    pdfs: post2.pdfs || [],
    post: post2.post || undefined,
    advantages: advantages,
  };

  return <Post2DetailClient post2={formattedPost2} />;
}
