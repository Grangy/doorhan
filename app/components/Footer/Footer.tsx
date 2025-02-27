import Link from 'next/link';
import ContactBlock from './ContactBlock';

export default function Footer() {
  return (
    <footer className="bg-main-doorhan text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* О компании */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">DOORHAN</h3>
            <p className="text-gray-400 text-sm">
              Профессиональные решения для автоматических ворот и систем контроля доступа
            </p>
          </div>

          <ContactBlock />

          {/* Навигация */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition">
                  Продукция
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-white transition">
                  Услуги
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-gray-400 hover:text-white transition">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Соцсети */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4">Мы в соцсетях</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">...</svg>
              </a>
              {/* Добавьте другие иконки */}
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Doorhan. Все права защищены
        </div>
      </div>
    </footer>
  );
}