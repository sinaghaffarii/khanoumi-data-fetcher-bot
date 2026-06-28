import fs from "fs-extra";
import path from "path";
import ExcelJS from "exceljs";
import { Product } from "../types/product";
import { logger } from "../utils/logger";
import { env } from "../config/env";
import { ImageDownloader } from "../utils/image-downloader";

interface ExportRow {
  id: number;
  type: string;
  sku: string;
  name: string;
  published: number;
  isFeatured: number;
  visibility: string;
  shortDescription: string;
  description: string;
  inStock: number;
  regularPrice: number | string;
  salePrice: number | string;
  categories: string;
  brands: string;
  images: string; // URL اصلی (برای وردپرس)
  localImagePath: string; // مسیر لوکال (برای آرشیو خودت)
}

export class ProductsExporter {
  private exportDir = path.resolve(process.cwd(), "exports");
  private imagesDir = path.join(this.exportDir, env.IMAGES_DIR);
  private downloader: ImageDownloader;

  constructor() {
    fs.ensureDirSync(this.exportDir);
    fs.ensureDirSync(this.imagesDir);
    this.downloader = new ImageDownloader(this.imagesDir);
  }

  public async export(products: Product[]): Promise<void> {
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("No products provided for export");
    }

    logger.info("Starting export process", { count: products.length });

    const timestamp = this.getTimestamp();

    // ابتدا عکس‌ها رو دانلود و دیتا رو نرمالایز می‌کنیم
    const rows = await this.buildRows(products);

    await Promise.all([
      this.exportJson(rows, timestamp),
      this.exportExcel(rows, timestamp),
      this.exportWooCsv(rows, timestamp),
    ]);

    logger.info("Export completed successfully");
  }

  /**
   * تبدیل محصولات به ردیف‌های آماده + دانلود تصاویر
   */
  private async buildRows(products: Product[]): Promise<ExportRow[]> {
    const rows: ExportRow[] = [];

    for (const p of products) {
      const fileNameBase = p.nameEn ?? p.nameFa ?? String(p.id);

      // دانلود عکس و گرفتن مسیر لوکال
      const localPath = p.imageUrl
        ? await this.downloader.download(p.imageUrl, fileNameBase)
        : null;

      rows.push({
        id: p.id,
        type: "simple",
        sku: String(p.id),
        name: p.nameFa ?? p.nameEn ?? "",
        published: 1,
        isFeatured: 0,
        visibility: "visible",
        shortDescription: p.shortDescription ?? "",
        description: p.description ?? "",
        inStock: p.hasStock ? 1 : 0,
        regularPrice: p.basePrice ?? "",
        salePrice: p.discountPrice ?? "",
        categories: (p.categories ?? [])
          .map((c) => c.nameFa)
          .filter(Boolean)
          .join(", "),
        brands: p.brand?.nameFa ?? p.brand?.nameEn ?? "",
        images: p.imageUrl ?? "", // 👈 URL اصلی برای وردپرس
        localImagePath: localPath
          ? path.resolve(localPath) // 👈 مسیر کامل لوکال
          : "",
      });
    }

    return rows;
  }

  private async exportJson(rows: ExportRow[], timestamp: string) {
    const filePath = path.join(this.exportDir, `products-${timestamp}.json`);
    await fs.writeJson(filePath, rows, { spaces: 2 });
    logger.info("JSON exported", { file: filePath });
  }

  /**
   * اکسل ساده برای بررسی خودت (نه برای ایمپورت وردپرس)
   */
  private async exportExcel(rows: ExportRow[], timestamp: string) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Products");

    sheet.columns = [
      { header: "ID", key: "id", width: 12 },
      { header: "Name", key: "name", width: 45 },
      { header: "Brand", key: "brands", width: 25 },
      { header: "Categories", key: "categories", width: 35 },
      { header: "Regular Price", key: "regularPrice", width: 15 },
      { header: "Sale Price", key: "salePrice", width: 15 },
      { header: "In Stock", key: "inStock", width: 10 },
      { header: "Image URL", key: "images", width: 50 },
      { header: "Local Image Path", key: "localImagePath", width: 60 },
    ];

    // 👇 با addRows و key درست، دیگه همه‌چیز تو ستون brand نمی‌ریزه
    sheet.addRows(rows);

    const filePath = path.join(this.exportDir, `products-${timestamp}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    logger.info("Excel exported", { file: filePath });
  }

  /**
   * 🎯 CSV استاندارد ووکامرس برای درون‌ریزی (Import)
   * هدرها دقیقاً مطابق فرمت فارسی ووکامرس
   */
  private async exportWooCsv(rows: ExportRow[], timestamp: string) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("WooImport");

    // هدرهای دقیق ووکامرس فارسی (مطابق فایلی که فرستادی)
    sheet.columns = [
      { header: "شناسه", key: "id", width: 12 },
      { header: "نوع", key: "type", width: 12 },
      { header: "شناسه محصول", key: "sku", width: 15 },
      { header: "نام", key: "name", width: 45 },
      { header: "منتشر شده", key: "published", width: 10 },
      { header: "ویژه است؟", key: "isFeatured", width: 10 },
      { header: "قابلیت نمایش در کاتالوگ", key: "visibility", width: 20 },
      { header: "توضیح کوتاه", key: "shortDescription", width: 40 },
      { header: "توضیحات", key: "description", width: 60 },
      { header: "وضعیت مالیات", key: "taxStatus", width: 15 },
      { header: "در انبار؟", key: "inStock", width: 10 },
      { header: "قیمت فروش فوق‌العاده", key: "salePrice", width: 18 },
      { header: "قیمت اصلی", key: "regularPrice", width: 15 },
      { header: "دسته‌ها", key: "categories", width: 35 },
      { header: "تصاویر", key: "images", width: 50 },
      { header: "برندها", key: "brands", width: 25 },
    ];

    for (const r of rows) {
      sheet.addRow({
        ...r,
        taxStatus: "taxable",
      });
    }

    const filePath = path.join(this.exportDir, `woocommerce-import-${timestamp}.csv`);

    // 👇 خروجی CSV با UTF-8 BOM (تا فارسی به‌هم نریزه)
    await workbook.csv.writeFile(filePath, {
      encoding: "utf-8",
    });

    // اضافه کردن BOM دستی برای اطمینان از نمایش درست فارسی در اکسل
    const content = await fs.readFile(filePath, "utf-8");
    await fs.writeFile(filePath, "\uFEFF" + content, "utf-8");

    logger.info("WooCommerce CSV exported", { file: filePath });
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  }
}

export const productsExporter = new ProductsExporter();
