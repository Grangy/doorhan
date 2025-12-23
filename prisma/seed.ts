import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Очистка существующих данных
  console.log('🧹 Очистка существующих данных...');
  await prisma.advantagePosts2.deleteMany();
  await prisma.advantage.deleteMany();
  await prisma.pdf.deleteMany();
  await prisma.colorPosts2.deleteMany();
  await prisma.color.deleteMany();
  await prisma.sliderPhotos.deleteMany();
  await prisma.posts2.deleteMany();
  await prisma.posts.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.user.deleteMany();

  // Создание пользователей
  console.log('👤 Создание пользователей...');
  await prisma.user.create({
    data: {
      email: 'admin@doorhan.ru',
      name: 'Администратор',
    },
  });
  await prisma.user.create({
    data: {
      email: 'manager@doorhan.ru',
      name: 'Менеджер',
    },
  });

  // Создание категорий постов (Posts)
  console.log('📁 Создание категорий...');
  const category1 = await prisma.posts.create({
    data: {
      name: 'Автоматические ворота',
      slug: 'avtomaticheskie-vorota',
      description: 'Современные автоматические ворота для частных и коммерческих объектов',
      image: '/img/upload/vorota-main.jpg',
      category: 'Ворота',
    },
  });

  const category2 = await prisma.posts.create({
    data: {
      name: 'Автоматические двери',
      slug: 'avtomaticheskie-dveri',
      description: 'Автоматические двери для магазинов, офисов и общественных зданий',
      image: '/img/upload/dveri-main.jpg',
      category: 'Двери',
    },
  });

  const category3 = await prisma.posts.create({
    data: {
      name: 'Шлагбаумы',
      slug: 'shlagbaumy',
      description: 'Автоматические шлагбаумы для парковок и КПП',
      image: '/img/upload/shlagbaum-main.jpg',
      category: 'Шлагбаумы',
    },
  });

  // Создание преимуществ
  console.log('⭐ Создание преимуществ...');
  const advantage1 = await prisma.advantage.create({
    data: {
      image: '/img/upload/advantage-1.png',
      text: 'Высокое качество материалов',
      order: 1,
    },
  });
  const advantage2 = await prisma.advantage.create({
    data: {
      image: '/img/upload/advantage-2.png',
      text: 'Долгий срок службы',
      order: 2,
    },
  });
  const advantage3 = await prisma.advantage.create({
    data: {
      image: '/img/upload/advantage-3.png',
      text: 'Простая установка',
      order: 3,
    },
  });
  const advantage4 = await prisma.advantage.create({
    data: {
      image: '/img/upload/advantage-4.png',
      text: 'Гарантия производителя',
      order: 4,
    },
  });

  // Создание цветов
  console.log('🎨 Создание цветов...');
  const color1 = await prisma.color.create({
    data: {
      name: 'Белый',
      image: '/img/upload/color-white.jpg',
      category: 'Стандартные',
      description: 'Классический белый цвет',
    },
  });
  const color2 = await prisma.color.create({
    data: {
      name: 'Коричневый',
      image: '/img/upload/color-brown.jpg',
      category: 'Стандартные',
      description: 'Теплый коричневый оттенок',
    },
  });
  const color3 = await prisma.color.create({
    data: {
      name: 'Серый',
      image: '/img/upload/color-gray.jpg',
      category: 'Стандартные',
      description: 'Современный серый цвет',
    },
  });
  const color4 = await prisma.color.create({
    data: {
      name: 'Черный',
      image: '/img/upload/color-black.jpg',
      category: 'Премиум',
      description: 'Элегантный черный цвет',
    },
  });

  // Создание продуктов (Posts2) для категории "Автоматические ворота"
  console.log('🚪 Создание продуктов...');
  await prisma.posts2.create({
    data: {
      name: 'Распашные ворота Doorhan',
      slug: 'raspashnye-vorota-doorhan',
      description: `
        <h2>Современные распашные ворота Doorhan</h2>
        <p>Распашные ворота Doorhan - это надежное решение для автоматизации въезда на территорию. 
        Изготовлены из высококачественной стали с порошковым покрытием, обеспечивающим защиту от коррозии.</p>
        <h3>Особенности:</h3>
        <ul>
          <li>Автоматическое открытие и закрытие</li>
          <li>Дистанционное управление</li>
          <li>Защита от защемления</li>
          <li>Работа при температуре от -40°C до +60°C</li>
        </ul>
      `,
      content: 'Полное описание продукта с техническими характеристиками...',
      image: '/img/upload/vorota-raspashnye.jpg',
      postId: category1.id,
      specs: [
        { name: 'Ширина проема', value: 'до 6 метров', unit: '' },
        { name: 'Высота', value: '2', unit: 'м' },
        { name: 'Мощность двигателя', value: '370', unit: 'Вт' },
        { name: 'Напряжение', value: '220', unit: 'В' },
        { name: 'Вес створки', value: 'до 500', unit: 'кг' },
      ],
      sliderPhotos: {
        create: [
          {
            name: 'Вид спереди',
            image: '/img/upload/vorota-1.jpg',
            order: 1,
          },
          {
            name: 'Вид сбоку',
            image: '/img/upload/vorota-2.jpg',
            order: 2,
          },
          {
            name: 'Детали механизма',
            image: '/img/upload/vorota-3.jpg',
            order: 3,
          },
        ],
      },
      colors: {
        create: [
          { colorId: color1.id },
          { colorId: color2.id },
          { colorId: color3.id },
        ],
      },
      advantages: {
        create: [
          { advantageId: advantage1.id },
          { advantageId: advantage2.id },
          { advantageId: advantage3.id },
        ],
      },
      pdfs: {
        create: [
          {
            title: 'Инструкция по установке',
            fileUrl: '/pdf/194c42a2985fb2a9ed66e5c00.pdf',
          },
          {
            title: 'Технический паспорт',
            fileUrl: '/pdf/194c42a2985fb2a9ed66e5c01.pdf',
          },
        ],
      },
    },
  });

  await prisma.posts2.create({
    data: {
      name: 'Откатные ворота Doorhan',
      slug: 'otkatnye-vorota-doorhan',
      description: `
        <h2>Откатные ворота Doorhan</h2>
        <p>Откатные ворота - идеальное решение для экономии пространства. 
        Ворота отъезжают в сторону, не занимая место перед въездом.</p>
        <h3>Преимущества:</h3>
        <ul>
          <li>Экономия пространства</li>
          <li>Быстрое открытие</li>
          <li>Надежная конструкция</li>
          <li>Долгий срок службы</li>
        </ul>
      `,
      image: '/img/upload/vorota-otkatnye.jpg',
      postId: category1.id,
      specs: [
        { name: 'Ширина проема', value: 'до 12 метров', unit: '' },
        { name: 'Высота', value: '2.5', unit: 'м' },
        { name: 'Мощность двигателя', value: '550', unit: 'Вт' },
        { name: 'Скорость открытия', value: '12', unit: 'м/мин' },
      ],
      sliderPhotos: {
        create: [
          {
            name: 'Общий вид',
            image: '/img/upload/otkatnye-1.jpg',
            order: 1,
          },
          {
            name: 'Механизм',
            image: '/img/upload/otkatnye-2.jpg',
            order: 2,
          },
        ],
      },
      colors: {
        create: [
          { colorId: color1.id },
          { colorId: color3.id },
          { colorId: color4.id },
        ],
      },
      advantages: {
        create: [
          { advantageId: advantage1.id },
          { advantageId: advantage2.id },
          { advantageId: advantage4.id },
        ],
      },
    },
  });

  await prisma.posts2.create({
    data: {
      name: 'Секционные ворота Doorhan',
      slug: 'sektsionnye-vorota-doorhan',
      description: `
        <h2>Секционные ворота для гаража</h2>
        <p>Секционные ворота Doorhan - современное решение для гаражей и складских помещений.</p>
      `,
      image: '/img/upload/vorota-sektsionnye.jpg',
      postId: category1.id,
      specs: [
        { name: 'Ширина проема', value: 'до 6 метров', unit: '' },
        { name: 'Высота', value: 'до 3.5', unit: 'м' },
        { name: 'Толщина панели', value: '40', unit: 'мм' },
      ],
      colors: {
        create: [
          { colorId: color2.id },
          { colorId: color3.id },
        ],
      },
      advantages: {
        create: [
          { advantageId: advantage1.id },
          { advantageId: advantage3.id },
        ],
      },
    },
  });

  // Создание продуктов для категории "Автоматические двери"
  await prisma.posts2.create({
    data: {
      name: 'Раздвижные двери',
      slug: 'razdvizhnye-dveri',
      description: `
        <h2>Автоматические раздвижные двери</h2>
        <p>Современные раздвижные двери для магазинов и офисов.</p>
      `,
      image: '/img/upload/dveri-razdvizhnye.jpg',
      postId: category2.id,
      specs: [
        { name: 'Ширина проема', value: 'до 4 метров', unit: '' },
        { name: 'Высота', value: '2.5', unit: 'м' },
      ],
      colors: {
        create: [
          { colorId: color1.id },
          { colorId: color4.id },
        ],
      },
    },
  });

  // Создание продуктов для категории "Шлагбаумы"
  await prisma.posts2.create({
    data: {
      name: 'Шлагбаум AN-MOTOR',
      slug: 'shlagbaum-an-motor',
      description: `
        <h2>Автоматический шлагбаум AN-MOTOR</h2>
        <p>Надежный шлагбаум для контроля доступа на парковки и КПП.</p>
      `,
      image: '/img/upload/shlagbaum-1.jpg',
      postId: category3.id,
      specs: [
        { name: 'Длина стрелы', value: '3-6', unit: 'м' },
        { name: 'Скорость открытия', value: '1.5', unit: 'сек' },
        { name: 'Мощность', value: '200', unit: 'Вт' },
      ],
      sliderPhotos: {
        create: [
          {
            name: 'Шлагбаум в работе',
            image: '/img/upload/shlagbaum-2.jpg',
            order: 1,
          },
        ],
      },
      advantages: {
        create: [
          { advantageId: advantage1.id },
          { advantageId: advantage2.id },
          { advantageId: advantage3.id },
        ],
      },
    },
  });

  // Создание блогов
  console.log('📝 Создание блогов...');
  await prisma.blog.create({
    data: {
      title: 'Как выбрать автоматические ворота',
      slug: 'kak-vybrat-avtomaticheskie-vorota',
      excerpt: 'Руководство по выбору автоматических ворот для вашего дома или бизнеса',
      coverImage: '/img/upload/blog-1.jpg',
      content: `
        <h1>Как выбрать автоматические ворота</h1>
        <p>Выбор автоматических ворот - это важное решение, которое влияет на безопасность и удобство использования.</p>
        <h2>Типы ворот</h2>
        <p>Существует несколько основных типов автоматических ворот...</p>
      `,
      publishedAt: new Date(),
    },
  });

  await prisma.blog.create({
    data: {
      title: 'Преимущества автоматизации',
      slug: 'preimushchestva-avtomatizatsii',
      excerpt: 'Почему стоит автоматизировать ворота и двери',
      coverImage: '/img/upload/blog-2.jpg',
      content: `
        <h1>Преимущества автоматизации</h1>
        <p>Автоматизация ворот и дверей приносит множество преимуществ...</p>
      `,
      publishedAt: new Date(),
    },
  });

  console.log('✅ База данных успешно заполнена!');
  console.log(`📊 Создано:`);
  console.log(`   - Пользователей: 2`);
  console.log(`   - Категорий: 3`);
  console.log(`   - Продуктов: 5`);
  console.log(`   - Цветов: 4`);
  console.log(`   - Преимуществ: 4`);
  console.log(`   - Блогов: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

