// app/contact/ContactPage.client.tsx
"use client";
import { useState, useEffect } from 'react';
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Breadcrumbs from "../components/Breadcrumbs";

export default function ContactPage() {
  // Состояния для полей формы
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  // Состояния для валидации, анимации и кнопки "Наверх"
  const [errors, setErrors] = useState<{ name?: string; phone?: string; comment?: string }>({});
  const [loaded, setLoaded] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => {
      setShowButton(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string; comment?: string } = {};
    if (!name.trim()) newErrors.name = 'Введите имя';
    if (!phone.trim()) newErrors.phone = 'Введите телефон';
    if (!comment.trim()) newErrors.comment = 'Введите комментарий';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch('/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            message: comment, // передаём комментарий в поле message
            page: window.location.href,
          }),
        });
        if (!response.ok) throw new Error('Ошибка при отправке данных');
        setName('');
        setPhone('');
        setComment('');
        alert('Сообщение отправлено!');
      } catch (error) {
        console.error('Ошибка:', error);
        alert('При отправке произошла ошибка. Попробуйте еще раз.');
      }
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <Header />
      <Breadcrumbs />
      <div className={`container mx-auto bg-gray-50 px-6 py-16 transition-all duration-700 mt-9 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-3xl font-bold mb-10 text-center text-main-doorhan">Контакты</h1>
        <div className="flex flex-col md:flex-row gap-10">
          {/* Контактная информация */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-main-doorhan">Контактная информация</h2>
            <p className="mb-2"><span className="font-semibold">Телефон:</span> +7 (123) 456-78-90</p>
            <p className="mb-2"><span className="font-semibold">Адрес:</span> г. Москва, ул. Примерная, 1</p>
            <p className="mb-2">
              <span className="font-semibold">Мы в соцсетях:</span>{' '}
              <a href="#" className="text-main-doorhan hover:text-main-doorhan transition-all duration-300">Facebook</a>,{' '}
              <a href="#" className="text-main-doorhan hover:text-main-doorhan transition-all duration-300">Instagram</a>,{' '}
              <a href="#" className="text-main-doorhan hover:text-main-doorhan transition-all duration-300">Twitter</a>
            </p>
          </div>
          {/* Форма обратной связи */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-main-doorhan">Напишите нам</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label htmlFor="name" className="block font-semibold mb-1 text-main-doorhan">Имя</label>
                <input
                  id="name"
                  type="text"
                  title="Введите ваше имя"
                  className={`w-full p-3 border rounded-lg outline-none transition-all duration-200 placeholder:text-main-doorhan ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-main-doorhan focus:ring-main-doorhan'}`}
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-red-600 italic text-sm mt-1">{errors.name}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block font-semibold mb-1 text-main-doorhan">Телефон</label>
                <input
                  id="phone"
                  type="tel"
                  title="Введите ваш телефон"
                  className={`w-full p-3 border rounded-lg outline-none transition-all duration-200 placeholder:text-main-doorhan ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-main-doorhan focus:ring-main-doorhan'}`}
                  placeholder="Ваш телефон"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && <p className="text-red-600 italic text-sm mt-1">{errors.phone}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block font-semibold mb-1 text-main-doorhan">Комментарий</label>
                <textarea
                  id="comment"
                  title="Введите ваш комментарий"
                  rows={5}
                  className={`w-full p-3 border rounded-lg outline-none transition-all duration-200 resize-none placeholder:text-main-doorhan ${errors.comment ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-main-doorhan focus:ring-main-doorhan'}`}
                  placeholder="Ваш комментарий"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                {errors.comment && <p className="text-red-600 italic text-sm mt-1">{errors.comment}</p>}
              </div>
              <button
                type="submit"
                className="bg-main-doorhan text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200 hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-main-doorhan focus:ring-offset-2"
              >
                Отправить
              </button>
            </form>
          </div>
        </div>
        {/* Блок с картой */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-main-doorhan">Мы на карте</h2>
          <div className="rounded-lg overflow-hidden shadow-md border-2 border-main-doorhan transition-all duration-300 hover:scale-105">
            <iframe
              src="https://yandex.ru/map-widget/v1/-/CBucU6V~8B"
              width="100%"
              height="400"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      </div>
      <Footer />
      {/* Кнопка "Наверх" */}
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-main-doorhan text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-main-doorhan"
          title="Наверх"
        >
          ↑
        </button>
      )}
    </>
  );
}
