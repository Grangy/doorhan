import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import prisma from "../prisma";
import Image from "next/image";
import Link from "next/link";
import ContactForm from "./components/ContactForm";



export default async function Home() {
  const posts = await prisma.posts.findMany();

  return (
    <>
      <Header />
      <main className="relative w-full">
        {/* Hero Section */}
        <div className="w-full pt-16">
          <div className="flex flex-col md:flex-row items-center min-h-[80vh]">
            {/* Левая часть */}
            <div className="md:w-1/2 p-8 space-y-6 lg:pl-12 xl:pl-24">
              <h1 className="text-5xl/none lg:text-6xl/none font-bold bg-gradient-to-r  bg-purple-600 to-sky-600  bg-clip-text text-transparent">
                Технологично
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                Исследуйте уникальные решения и инновационные подходы на рынке
                автоматизации ворот
              </p>
              <Link href="/posts" passHref>
                <button className="relative mt-4 inline-flex items-center px-8 py-4 overflow-hidden text-lg font-medium text-white transition-all duration-500 bg-gradient-to-r  bg-purple-600 to-sky-600 rounded-lg hover:bg-blue-700 group hover:scale-[1.02]">
                  <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-64 group-hover:h-64 opacity-10"></span>
                  <span className="relative">Начать путешествие</span>
                  <svg
                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </button>
              </Link>
            </div>

            {/* Правая часть с видео */}
            <div className="md:w-1/2 w-full h-full relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 transform rotate-1 scale-95 rounded-xl blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative transform transition-transform duration-700 hover:scale-[1.01] hover:-translate-y-2">
                <video
                  className="w-full h-full object-cover rounded-xl shadow-2xl mr-5 border-white/10"
                  src="/video/video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </div>
          </div>
        </div>

        {/* Сетка постов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8 pb-16">
          {posts.map((post: { id: number; slug: string | null; name: string | null; image: string | null }) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug || post.id}`}
              className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2"
            >
              <div className="mb-4 overflow-hidden rounded-lg">
                {post.image && (
                  <div className="relative w-full pb-[56.25%]">
                    <Image
                      src={post.image.startsWith('/') ? post.image : `/${post.image}`}
                      alt={post.name || "Пост"}
                      fill
                      className="object-fit transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                {post.name}
              </h2>
            </Link>
          ))}
        </div>
        <ContactForm />

      </main>
      <Footer />
    </>
  );
}
