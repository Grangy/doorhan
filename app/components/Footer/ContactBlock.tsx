export default function ContactBlock() {
    return (
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4">Контакты</h4>
        <ul className="space-y-2 text-gray-400">
          <li>ул. Маршала Советского Союза Буденного С.М., 32И, Симферопольэтаж 5</li>
          <li>Телефон: <a href="tel:+79782944149">+7 978 294 41 49</a></li>
          <li>Email: <a href="mailto:zakaz@doorhan-zavod.ru">zakaz@doorhan-zavod.ru</a></li>
          <li>Режим работы: Пн-Пт 9:00-18:00</li>
        </ul>
      </div>
    );
  }