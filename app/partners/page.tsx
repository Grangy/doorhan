"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  FiPenTool,
  FiTool,
  FiShoppingCart,
  FiBriefcase,
  FiLayers,
  FiSettings,
  FiZap,
  FiTarget,
  FiMonitor,
  FiAnchor,
  FiGlobe,
  FiCpu
} from 'react-icons/fi';
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import FeedbackForm from "../components/FeedbackForm/FeedbackForm"; // Импорт компонента PopUp с формой

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const tileVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function SolutionsPage() {
  const [loaded, setLoaded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const solutions = [
    {
      title: "Для архитекторов",
      image: "/img/partners/architectors.webp",
      description: [
        "Мы понимаем, что для архитекторов важны инновационные решения и эстетика, поэтому продукция Doorhan сочетает стиль и функциональность.",
        "Наши решения помогают воплотить самые смелые архитектурные идеи, поддерживая высочайшие стандарты качества. Мы предлагаем индивидуальные консультации и техническую поддержку для создания уникальных проектов."
      ],
      icons: [<FiPenTool key="pentool" />, <FiZap key="zap" />, <FiTarget key="target" />]
    },
    {
      title: "Для проектировщиков",
      image: "/img/partners/proect.webp",
      description: [
        "Мы помогаем проектировщикам подобрать изделия, максимально соответствующие функциональным потребностям каждого проекта.",
        "Наши эксперты предоставляют квалифицированное мнение и рекомендации для оптимизации технических решений. Совместная работа с Doorhan обеспечивает надежность, эффективность и долговечность реализованных проектов."
      ],
      icons: [<FiTool key="tool" />, <FiMonitor key="monitor" />, <FiAnchor key="anchor" />]
    },
    {
      title: "Для дилеров",
      image: "/img/partners/dealer.webp",
      description: [
        "Дилерам мы предлагаем стабильные поставки, конкурентные условия сотрудничества и всестороннюю поддержку – от обучения до маркетинговых материалов.",
        "Наша продукция Doorhan отличается высоким качеством, что помогает завоевывать доверие конечных потребителей. Становясь нашим партнером, вы расширяете ассортимент и открываете новые возможности на рынке."
      ],
      icons: [<FiShoppingCart key="cart" />, <FiGlobe key="globe" />, <FiCpu key="cpu" />]
    },
    {
      title: "Для корпоративных клиентов",
      image: "/img/partners/corporat.webp",
      description: [
        "Корпоративным клиентам мы предлагаем индивидуальный подход, комплексное сопровождение и гибкие условия сотрудничества.",
        "Наши решения соответствуют самым высоким стандартам безопасности и эффективности, что важно для крупных проектов. Doorhan помогает оптимизировать затраты и обеспечить надежность ваших объектов, сопровождая каждый этап реализации проекта."
      ],
      icons: [<FiBriefcase key="briefcase" />, <FiLayers key="layers2" />, <FiSettings key="settings2" />]
    }
  ];

  return (
    <>
      <Header />
      <motion.div
        className="container mx-auto bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-16 transition-all duration-700"
        initial="hidden"
        animate={loaded ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <h1 className="text-3xl font-bold mb-10 text-center text-main-doorhan mt-12">
          РЕШЕНИЯ ДЛЯ ПАРТНЕРОВ
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-transform duration-300 hover:scale-105 border border-transparent hover:border-main-doorhan flex flex-col"
              variants={tileVariants}
              whileHover={{ scale: 1.03 }}
            >
              <div className="w-full overflow-hidden rounded-t-lg relative">
                <div className="aspect-video relative">
                  <Image
                    src={solution.image}
                    alt={solution.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  {solution.icons.map((icon, idx) => (
                    <span key={idx} className="text-main-doorhan text-xl" aria-hidden="true">
                      {icon}
                    </span>
                  ))}
                  <h2 className="text-2xl font-semibold text-main-doorhan">{solution.title}</h2>
                </div>
                {solution.description.map((para, idx) => (
                  <p key={idx} className="mb-3 text-gray-700">
                    {para}
                  </p>
                ))}
                <div className="mt-auto">
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="mt-4 bg-main-doorhan text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                  >
                    Связаться
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Footer />

      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-main-doorhan text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-main-doorhan"
          title="Наверх"
        >
          ↑
        </button>
      )}

      {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}
    </>
  );
}
