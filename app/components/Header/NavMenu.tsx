import Link from 'next/link';

export default function NavMenu() {
  return (
    <nav className="hidden md:flex space-x-8">
      <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
        Главная
      </Link>
      <Link href="/products" className="text-white hover:text-blue-600 transition">
        Продукция
      </Link>
      <Link href="/services" className="text-white hover:text-blue-600 transition">
        Услуги
      </Link>
      <Link href="/contact" className="text-white hover:text-blue-600 transition">
        Контакты
      </Link>
    </nav>
  );
}