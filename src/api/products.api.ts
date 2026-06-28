import { httpClient } from "./httpClient";
import { env } from "../config/env";
import { ProductApiResponse } from "../types/product";

export interface GetProductsParams {
  page_number: number;
  cat_id: number;
  page_size?: number;
  analytics_tag?: string;
  ut: string;
}

export class ProductsApi {
  async fetchProducts(params: GetProductsParams): Promise<ProductApiResponse> {
    return httpClient.get<ProductApiResponse>(env.PRODUCTS_ENDPOINT, {
      page_number: params.page_number,
      cat_id: params.cat_id,
      page_size: params.page_size ?? env.DEFAULT_PAGE_SIZE,
      analytics_tag: params.analytics_tag ?? "CategoryPLP",
      ut: params.ut,
    });
  }
}

export const productsApi = new ProductsApi();
