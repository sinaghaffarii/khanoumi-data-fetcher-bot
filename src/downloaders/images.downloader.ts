import path from "path";
import fs from "fs-extra";
import { productsService } from "../services/products.service";
import { ImageDownloader } from "../utils/image-downloader";
import { CategoryConfig } from "../config/categories";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export class CategoryImagesDownloader {
  private baseImagesDir = path.resolve(process.cwd(), "exports", "images");
  // محدودیت دانلود همزمان برای جلوگیری از بلاک شدن
  private readonly CONCURRENCY = 5;

  /**
   * عکس‌های یک دسته‌بندی رو دانلود و در فولدر مخصوصش ذخیره می‌کنه
   */
  public async downloadByCategory(category: CategoryConfig): Promise<void> {
    const targetDir = path.join(this.baseImagesDir, category.folderName);
    fs.ensureDirSync(targetDir);

    const downloader = new ImageDownloader(targetDir);

    logger.info("Fetching products for image download", {
      folder: category.folderName,
      catId: category.catId,
    });

    // استفاده از سرویس موجود — هیچ کد تکراری نداریم
    const products = await productsService.getAllProducts({
      cat_id: category.catId,
      ut: "9006735a-8e48-4461-8a21-8e6882114067",
      page_size: env.DEFAULT_PAGE_SIZE,
    });

    logger.info("Products fetched, starting image download", {
      count: products.length,
      folder: category.folderName,
    });

    let success = 0;
    let failed = 0;

    // دانلود دسته‌ای (batch) برای کنترل فشار روی سرور
    for (let i = 0; i < products.length; i += this.CONCURRENCY) {
      const batch = products.slice(i, i + this.CONCURRENCY);

      await Promise.all(
        batch.map(async (p) => {
          const fileNameBase = p.nameEn ?? p.nameFa ?? String(p.id);

          if (!p.imageUrl) {
            failed++;
            return;
          }

          const result = await downloader.download(p.imageUrl, fileNameBase);
          result ? success++ : failed++;
        })
      );

      logger.info(
        `Progress: ${Math.min(i + this.CONCURRENCY, products.length)}/${products.length}`
      );
    }

    logger.info("Image download finished", {
      folder: category.folderName,
      success,
      failed,
      total: products.length,
    });
  }
}

export const categoryImagesDownloader = new CategoryImagesDownloader();
