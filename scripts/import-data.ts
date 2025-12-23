import prisma from "../prisma";
import fs from "fs";
import path from "path";

interface CategoryData {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  products: ProductData[];
}

interface ProductData {
  id: number;
  name: string;
  title: string | null;
  description: string | null;
  shortDescription: string | null;
  mainImageUrl: string | null;
  categoryId: number;
  slug: string;
  sku: string | null;
  price: string | null;
  specifications: SpecificationData[];
  images: ProductImageData[];
}

interface SpecificationData {
  name: string;
  value: string;
  unit: string | null;
  sortOrder: number;
}

interface ProductImageData {
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isMain: boolean;
}

interface ImportData {
  categories: CategoryData[];
  products: ProductData[];
}

async function importData() {
  console.log("🚀 Начинаем импорт данных...\n");

  // Читаем JSON файл
  const jsonPath = path.join(process.cwd(), "data", "import", "database-export.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Файл не найден: ${jsonPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(jsonPath, "utf-8");
  const data: ImportData = JSON.parse(fileContent);

  console.log(`📊 Найдено категорий: ${data.categories?.length || 0}`);
  console.log(`📦 Найдено товаров: ${data.products?.length || 0}\n`);

  // Очищаем существующие данные (опционально)
  console.log("🗑️  Очистка существующих данных...");
  await prisma.posts2.deleteMany({});
  await prisma.posts.deleteMany({});
  console.log("✅ Данные очищены\n");

  // Создаем категории
  const categoryMap = new Map<number, number>(); // oldId -> newId

  if (data.categories && data.categories.length > 0) {
    console.log("📁 Создание категорий...");
    for (const category of data.categories) {
      try {
        // Преобразуем imageUrl в относительный путь
        let imagePath = null;
        if (category.imageUrl) {
          // Убираем начальный слэш если есть, но потом добавляем обратно для Next.js
          imagePath = category.imageUrl.startsWith("/") 
            ? category.imageUrl 
            : `/${category.imageUrl}`;
        }

        const newCategory = await prisma.posts.create({
          data: {
            name: category.name,
            slug: category.slug,
            description: category.description || category.seoDescription || null,
            image: imagePath,
            category: category.seoTitle || null,
          },
        });

        categoryMap.set(category.id, newCategory.id);
        console.log(`  ✅ Создана категория: ${category.name} (ID: ${newCategory.id})`);
      } catch (error: unknown) {
        const err = error as { message?: string; code?: string };
        console.error(`  ❌ Ошибка при создании категории ${category.name}:`, err.message || err);
      }
    }
    console.log(`✅ Создано категорий: ${categoryMap.size}\n`);
  }

  // Создаем товары
  let productsCreated = 0;
  let productsSkipped = 0;

  if (data.products && data.products.length > 0) {
    console.log("📦 Создание товаров...");
    for (const product of data.products) {
      try {
        // Находим новую категорию
        const newCategoryId = categoryMap.get(product.categoryId);
        if (!newCategoryId) {
          console.log(`  ⚠️  Пропущен товар ${product.name}: категория ${product.categoryId} не найдена`);
          productsSkipped++;
          continue;
        }

        // Преобразуем mainImageUrl
        let imagePath = null;
        if (product.mainImageUrl) {
          imagePath = product.mainImageUrl.startsWith("/")
            ? product.mainImageUrl
            : `/${product.mainImageUrl}`;
        }

        // Преобразуем specifications в JSON
        let specsJson = null;
        if (product.specifications && product.specifications.length > 0) {
          specsJson = product.specifications.map((spec) => ({
            name: spec.name,
            value: spec.value,
            unit: spec.unit,
            order: spec.sortOrder,
          }));
        }

        // Создаем metadata из дополнительных полей
        const metadata: Record<string, unknown> = {};
        if (product.sku) metadata.sku = product.sku;
        if (product.price) metadata.price = product.price;
        if (product.shortDescription) metadata.shortDescription = product.shortDescription;
        if (product.title && product.title !== product.name) metadata.title = product.title;

        // Собираем все изображения
        const allImages = product.images || [];
        if (product.mainImageUrl && !allImages.some((img) => img.imageUrl === product.mainImageUrl)) {
          allImages.unshift({
            imageUrl: product.mainImageUrl,
            altText: product.name,
            sortOrder: 0,
            isMain: true,
          });
        }

        await prisma.posts2.create({
          data: {
            name: product.name,
            slug: product.slug,
            description: product.description || product.shortDescription || null,
            content: product.description || null, // Используем description как content
            image: imagePath,
            metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
            specs: specsJson ? JSON.parse(JSON.stringify(specsJson)) : null,
            postId: newCategoryId,
          },
        });

        productsCreated++;
        if (productsCreated % 10 === 0) {
          console.log(`  📊 Обработано товаров: ${productsCreated}`);
        }
      } catch (error: unknown) {
        const err = error as { message?: string; code?: string };
        console.error(`  ❌ Ошибка при создании товара ${product.name}:`, err.message || err);
        productsSkipped++;
      }
    }
    console.log(`\n✅ Создано товаров: ${productsCreated}`);
    if (productsSkipped > 0) {
      console.log(`⚠️  Пропущено товаров: ${productsSkipped}`);
    }
  }

  // Если товары есть в категориях, обрабатываем их тоже
  if (data.categories) {
    for (const category of data.categories) {
      if (category.products && category.products.length > 0) {
        for (const product of category.products) {
          // Проверяем, не создан ли уже товар
          const exists = await prisma.posts2.findFirst({
            where: { slug: product.slug },
          });

          if (exists) {
            continue; // Пропускаем, если уже создан
          }

          try {
            const newCategoryId = categoryMap.get(category.id);
            if (!newCategoryId) {
              continue;
            }

            let imagePath = null;
            if (product.mainImageUrl) {
              imagePath = product.mainImageUrl.startsWith("/")
                ? product.mainImageUrl
                : `/${product.mainImageUrl}`;
            }

            let specsJson = null;
            if (product.specifications && product.specifications.length > 0) {
              specsJson = product.specifications.map((spec) => ({
                name: spec.name,
                value: spec.value,
                unit: spec.unit,
                order: spec.sortOrder,
              }));
            }

            const metadata: Record<string, unknown> = {};
            if (product.sku) metadata.sku = product.sku;
            if (product.price) metadata.price = product.price;
            if (product.shortDescription) metadata.shortDescription = product.shortDescription;
            if (product.title && product.title !== product.name) metadata.title = product.title;

            await prisma.posts2.create({
              data: {
                name: product.name,
                slug: product.slug,
                description: product.description || product.shortDescription || null,
                content: product.description || null,
                image: imagePath,
                metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
                specs: specsJson ? JSON.parse(JSON.stringify(specsJson)) : null,
                postId: newCategoryId,
              },
            });

            productsCreated++;
          } catch (error: unknown) {
            const err = error as { message?: string; code?: string };
            console.error(`  ❌ Ошибка при создании товара из категории ${product.name}:`, err.message || err);
            productsSkipped++;
          }
        }
      }
    }
  }

  console.log("\n🎉 Импорт завершен!");
  console.log(`📊 Итого:`);
  console.log(`   - Категорий: ${categoryMap.size}`);
  console.log(`   - Товаров: ${productsCreated}`);
  console.log(`   - Пропущено: ${productsSkipped}`);
}

// Запускаем импорт
importData()
  .then(() => {
    console.log("\n✅ Скрипт выполнен успешно");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Ошибка при выполнении скрипта:", error);
    process.exit(1);
  });

