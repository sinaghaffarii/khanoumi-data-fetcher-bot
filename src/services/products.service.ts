import { productsApi, GetProductsParams } from "../api/products.api";
import { logger } from "../utils/logger";
import { Product } from "../types/product";

export class ProductsService {
  async getAllProducts(params: Omit<GetProductsParams, "page_number">) {
    const allProducts: Product[] = [];

    let page = 1;
    let hasNext = true;

    while (hasNext) {
      try {
        logger.info(`Fetching page ${page}`);

        const response = await productsApi.fetchProducts({
          ...params,
          page_number: page,
        });

        const productsContainer = response?.data?.products;

        // ✅ normalize safely
        const products: Product[] = Array.isArray(productsContainer?.items)
          ? productsContainer.items
          : [];

        if (!Array.isArray(products)) {
          throw new Error("Invalid products.items structure");
        }

        allProducts.push(...products);

        const pagination = response.data.pagination;

        if (!pagination?.total_pages) {
          hasNext = products.length > 0;
        } else {
          hasNext = page < pagination.total_pages;
        }

        page++;
      } catch (error) {
        logger.error(`Failed on page ${page}`, error);
        throw error;
      }
    }

    logger.info("Finished fetching products", {
      total: allProducts.length,
    });

    return allProducts;
  }
}

export const productsService = new ProductsService();
