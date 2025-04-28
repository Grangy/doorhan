'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiMenu, HiX, HiPhone } from 'react-icons/hi';
import { RiProductHuntLine, RiContactsLine } from 'react-icons/ri';
import Image from 'next/image';
import FeedbackForm from '../FeedbackForm/FeedbackForm';
import LiveSearch from "../LiveSearch/LiveSearch"; // импортируем новый компонент

const SHOW_ICONS = false;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
  }, [isMenuOpen]);

  const navLinks = [
    { href: '/posts', name: 'Продукция', icon: <RiProductHuntLine className="w-5 h-5" /> },
    { href: '/partners', name: 'Партнерам', icon: <RiContactsLine className="w-5 h-5" /> },
    { href: '/contact', name: 'Контакты', icon: <RiContactsLine className="w-5 h-5" /> },
  ];

  return (
    <>
      <header className="shadow-sm fixed w-full z-50 bg-sky-900">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Логотип и мобильное меню */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Открыть меню"
            >
              <HiMenu className="w-6 h-6 text-white" />
            </button>
            <Link href="/" className="flex items-center">
  <div className="relative" style={{ 
    width: 'auto', 
    height: '25px', // или любая другая фиксированная высота
    aspectRatio: '195/38' // соотношение ширины к высоте вашего лого
  }}>
    <Image
      src="/img/logo/logo2.png"
      alt="Логотип"
      fill
      className="object-contain"
      priority
    />
  </div>
</Link>
          </div>

          {/* Десктопное меню */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  pathname === link.href
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                {SHOW_ICONS && link.icon}
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* Контактная информация и поиск */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4">
              <LiveSearch />
              <div className="text-right">
                <p className="text-sm font-semibold text-white">+7 978 263‑95‑21</p>
                <p className="text-xs text-gray-200">Ежедневно 9:00 - 18:00</p>
              </div>
            </div>
            <button
              onClick={() => setIsPopupOpen(true)}
              className="bg-white text-main-doorhan px-6 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
            >
              <HiPhone className="w-5 h-5" />
              <span>Заказать</span>
            </button>
          </div>

          {/* Мобильное меню */}
          {isMenuOpen && (
            <div className="fixed inset-0 bg-black/50 md:hidden z-50" onClick={() => setIsMenuOpen(false)}>
              <div
                className="absolute top-0 left-0 w-3/4 h-full bg-sky-900 shadow-xl p-4 transform transition-transform duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-bold text-white">Меню</span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <HiX className="w-6 h-6 text-white" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                        pathname === link.href
                          ? 'bg-blue-50 text-sky-900'
                          : 'text-white hover:bg-gray-100'
                      }`}
                    >
                      {link.icon}
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-col gap-4">
                    {/* Используем LiveSearch в мобильном меню */}
                    <LiveSearch />
                    <div className="text-white">
                      <p className="font-medium flex items-center gap-2">
                        <HiPhone className="w-5 h-5" />
                        +7 978 782‑24‑79
                      </p>
                      <p className="text-sm mt-1">Ежедневно 9:00 - 18:00</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsPopupOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-white text-sky-900 py-3 rounded-lg hover:bg-gray-100 transition shadow-md hover:shadow-lg active:scale-95"
                    >
                      Заказать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {isPopupOpen && <FeedbackForm onClose={() => setIsPopupOpen(false)} />}
    </>
  );
}
