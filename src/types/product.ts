export interface ProductApiResponse {
  data: {
    products: ProductsContainer;
    pagination?: Pagination;
    facets?: {
      categories?: CategoryFacet[];
    };
  };
}

export interface ProductsContainer {
  items: Product[];
}

export interface Pagination {
  page_number: number;
  page_size: number;
  total_pages?: number;
  total_items?: number;
}

export interface Brand {
  id?: number;
  nameFa?: string;
  nameEn?: string;
  slug?: string;
}

// 🔴 این تایپ رو بر اساس خروجی واقعی API اصلاح کن
export interface Product {
  id: number;
  nameFa?: string;
  nameEn?: string;
  brand?: Brand;
  basePrice?: number;
  discountPrice?: number;
  hasStock?: boolean;
  isSalable?: boolean;
  imageUrl?: string;
  // فیلدهای احتمالی دیگه:
  description?: string;
  shortDescription?: string;
  categories?: Array<{ id: number; nameFa?: string }>;
}

export interface CategoryFacet {
  id: number;
  name: string;
  slug?: string;
}
