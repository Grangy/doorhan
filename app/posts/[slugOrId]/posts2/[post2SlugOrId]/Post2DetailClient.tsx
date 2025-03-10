"use client";

import React, { forwardRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import Header from "../../../../components/Header/Header";
import Footer from "../../../../components/Footer/Footer";
import HowWeWork from "../../../../components/HowWeWork";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import ContactForm from "../../../../components/ContactForm";


export type Spec = {
  name: string;
  value: string | number;
  unit?: string;
};


export type Post2Type = {
  id: string;
  name: string | null;
  image: string | null;
  description: string | null;
  specs?: Spec[];
  colors?: {
    color: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }[];
  sliderPhotos?: {
    id: string;
    image: string;
    name: string | null;
    order: number;
    posts2Id: string;
  }[];
  pdfs?: {
    id: string;
    fileUrl: string;
    title: string;
  }[];
  post?: {
    id: string;
    name: string | null;
    slug: string | null;
    description: string | null;
    image: string | null;
    category: string | null;
  };
  advantages?: {
    id: string;
    image: string;
    text: string;
    order: number;
  }[];
};


type Props = {
  post2: Post2Type;
};

type ModalImageType = {
  imageUrl: string;
  alt: string;
};

type ImageModalProps = {
  imageUrl: string;
  alt: string;
  onClose: () => void;
};

/** Компонент модального окна для увеличенного изображения */
const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, alt, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-0 right-0 m-2 text-white text-2xl"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        <Image
          src={imageUrl}
          alt={alt}
          width={800}
          height={600}
          className="object-contain"
        />
      </div>
    </div>
  );
};

/** Ссылка "Skip to content" для улучшения доступности */
const SkipToContent = () => (
  <a
    href="#main-content"
    className="absolute top-0 left-0 m-4 p-2 bg-blue-600 text-white rounded transform -translate-y-full focus:translate-y-0 transition-transform duration-300 z-50"
  >
    Перейти к содержимому
  </a>
);


/** Секция с техническими характеристиками */
const SpecsSection = ({ specs }: { specs: Spec[] }) => {
  if (!specs || specs.length === 0) return null;
  return (
    <section className="mt-8 border-t pt-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Технические характеристики
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {specs
          .filter(
            (spec): spec is Spec =>
              typeof spec === "object" &&
              spec !== null &&
              "name" in spec &&
              "value" in spec
          )
          .map((spec, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"
            >
              <span className="text-gray-600 font-medium">{spec.name}</span>
              <span className="text-gray-800 text-right">
                {spec.value}
                {spec.unit && (
                  <span className="text-gray-500 ml-1">({spec.unit})</span>
                )}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
};

/** Секция вариантов цвета */
const ColorsSection = ({
  colors,
}: {
  colors: Post2Type["colors"];
}) => {
  if (!colors || colors.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Варианты цвета
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {colors.map((colorPost) => (
          <div
            key={colorPost.color.id}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow transition-transform duration-200 hover:scale-105 cursor-pointer"
          >
            <Image
              src={colorPost.color.image || "/default-image.png"}
              alt={colorPost.color.name || "Цвет"}
              width={100}
              height={100}
              className="rounded-full object-cover"
            />
            <p className="mt-3 text-gray-700 font-medium">
              {colorPost.color.name || "Без названия"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

/** Секция родительского поста */
const ParentPostSection = ({ post }: { post: Post2Type["post"] }) => {
  if (!post) return null;
  return (
    <section className="mt-8 border-t pt-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Родительский пост
      </h2>
      <div className="inline-block">
        <Link
          href={`/posts/${post.id}`}
          className="inline-flex items-center text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors duration-300"
          aria-label={`Перейти к родительскому посту: ${
            post.name || "Без названия"
          }`}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          {post.name || "Без названия"}
        </Link>
      </div>
    </section>
  );
};

/** Секция дополнительных изображений (слайдер) */
const SliderPhotosSection = ({
  sliderPhotos,
  onImageClick,
}: {
  sliderPhotos: Post2Type["sliderPhotos"];
  onImageClick: (imageUrl: string, alt: string) => void;
}) => {
  if (!sliderPhotos || sliderPhotos.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Дополнительные изображения
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {sliderPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() =>
              onImageClick(photo.image, photo.name || "Дополнительное изображение")
            }
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow transition-transform duration-200 hover:scale-105 cursor-pointer"
          >
            <Image
              src={photo.image}
              alt={photo.name || "Дополнительное изображение"}
              width={200}
              height={150}
              className="rounded-lg object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

/** Секция преимуществ */
const AdvantagesSection = ({
  advantages,
}: {
  advantages: Post2Type["advantages"];
}) => {
  if (!advantages || advantages.length === 0) return null;
  // Сортируем по order для корректного порядка вывода
  const sortedAdvantages = [...advantages].sort((a, b) => a.order - b.order);
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Преимущества
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedAdvantages.map((adv) => (
          <div key={adv.id} className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
            {adv.image && (
              <Image
                src={adv.image}
                alt={adv.text || "Преимущество"}
                width={200}
                height={150}
                className="object-cover w-full h-40 rounded-t-lg"
              />
            )}
            <p className="mt-2 text-center text-gray-700">{adv.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};


/** Секция PDF файлов */
const PdfsSection = ({ pdfs }: { pdfs: Post2Type["pdfs"] }) => {
  if (!pdfs || pdfs.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Материалы и файлы
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {pdfs.map((pdf) => (
          <div
            key={pdf.id}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <a
              href={pdf.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-red-500 mb-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 2a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6H6z" />
                <path fill="#fff" d="M14 3.5L18.5 8H14z" />
                <path d="M8 14h1.5v3H11v-3h1.5v-1.5H11v-2H9.5v2H8z" />
              </svg>
              <span className="text-lg font-medium text-gray-700">
                {pdf.title}
              </span>
            </a>
            <a
              href={pdf.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-blue-600 hover:underline"
            >
              Скачать
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

/** Кнопка "Наверх" */
const ScrollToTopButton = () => (
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
    aria-label="Наверх"
  >
    ↑
  </button>
);

const Post2DetailClient = forwardRef<HTMLDivElement, Props>(
  ({ post2 }, ref) => {
    const [modalImage, setModalImage] = useState<ModalImageType | null>(null);

    const openModal = (imageUrl: string, alt: string) => {
      setModalImage({ imageUrl, alt });
    };

    const closeModal = () => {
      setModalImage(null);
    };

    return (
      <div ref={ref}>
        <SkipToContent />
        <Header />
        <Breadcrumbs />

        <main id="main-content" className="container mx-auto p-4">


          <article className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
            {post2.image && (
              <div
              onClick={() =>
                openModal(post2.image!, post2.name || "Изображение поста")
              }              
                className="relative mb-8 overflow-hidden rounded-2xl shadow-xl transition-shadow duration-300 h-[60vh] cursor-pointer"
              >
                <Image
                  src={post2.image}
                  alt={post2.name || "Изображение поста"}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="object-contain transition-all duration-300"
                  quality={80}
                  priority={false}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300" />
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {post2.name || "Posts2 без названия"}
            </h1>

            {post2.description && (
              <div
                className="text-gray-700 text-lg leading-relaxed mb-8 prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post2.description),
                }}
              />
            )}

            <SpecsSection specs={post2.specs || []} />
            <ColorsSection colors={post2.colors} />
            <ParentPostSection post={post2.post} />
          </article>

          <SliderPhotosSection
            sliderPhotos={post2.sliderPhotos}
            onImageClick={openModal}
          />
            <AdvantagesSection advantages={post2.advantages || []} />

          <PdfsSection pdfs={post2.pdfs} />

          {/* Вставляем компонент формы */}
          <ContactForm />
          <ScrollToTopButton />
        </main>

        <HowWeWork />
        <Footer />

        {modalImage && (
          <ImageModal
            imageUrl={modalImage.imageUrl}
            alt={modalImage.alt}
            onClose={closeModal}
          />
        )}
      </div>
    );
  }
);

Post2DetailClient.displayName = "Post2DetailClient";

export default Post2DetailClient;
