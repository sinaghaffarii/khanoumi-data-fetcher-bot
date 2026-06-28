import { productsService } from "./services/products.service";
import { productsExporter } from "./exporters/products.exporter";
import { logger } from "./utils/logger";

async function bootstrap() {
  try {
    logger.info("Scraper started");

    const products = await productsService.getAllProducts({
      cat_id: 370,
      ut: "9006735a-8e48-4461-8a21-8e6882114067",
      page_size: 24,
    });

    logger.info("Scraping completed", { count: products.length });

    if (products.length === 0) {
      logger.warn("No products found. Skipping export.");
      return;
    }

    // برای دیباگ ساختار اولین محصول (در صورت نیاز)
    logger.debug("First product sample", products[0]);

    await productsExporter.export(products);
  } catch (error) {
    logger.error("Fatal error in scraper", error);
    process.exit(1);
  }
}

bootstrap();
