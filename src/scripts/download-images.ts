import { categoryImagesDownloader } from "../downloaders/images.downloader";
import { CATEGORIES } from "../config/categories";
import { logger } from "../utils/logger";

async function run() {
  // اسم دسته‌بندی رو از آرگومان خط فرمان می‌گیریم
  // مثال: npm run images personalCare
  const categoryKey = process.argv[2];

  try {
    if (categoryKey) {
      // دانلود فقط یک دسته‌بندی خاص
      const category = CATEGORIES[categoryKey];

      if (!category) {
        logger.error("Category not found", {
          requested: categoryKey,
          available: Object.keys(CATEGORIES),
        });
        process.exit(1);
      }

      await categoryImagesDownloader.downloadByCategory(category);
    } else {
      // اگه آرگومان ندادی، همه دسته‌بندی‌ها رو دانلود می‌کنه
      logger.info("No category specified, downloading ALL categories");

      for (const key of Object.keys(CATEGORIES)) {
        await categoryImagesDownloader.downloadByCategory(CATEGORIES[key]);
      }
    }

    logger.info("✅ All done!");
  } catch (error) {
    logger.error("Fatal error in image downloader", error);
    process.exit(1);
  }
}

run();
