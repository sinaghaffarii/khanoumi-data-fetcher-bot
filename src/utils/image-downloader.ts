import fs from "fs-extra";
import path from "path";
import axios from "axios";
import { logger } from "./logger";

export class ImageDownloader {
  private imagesDir: string;

  constructor(imagesDir: string) {
    this.imagesDir = imagesDir;
    fs.ensureDirSync(this.imagesDir);
  }

  /**
   * عکس رو دانلود می‌کنه و مسیر کامل لوکال رو برمی‌گردونه
   */
  public async download(imageUrl: string, fileNameBase: string): Promise<string | null> {
    if (!imageUrl) return null;

    try {
      const ext = this.getExtension(imageUrl);
      const safeName = this.sanitizeFileName(fileNameBase);
      const fileName = `${safeName}${ext}`;
      const filePath = path.join(this.imagesDir, fileName);

      // اگه قبلاً دانلود شده، دوباره دانلود نکن
      if (await fs.pathExists(filePath)) {
        return filePath;
      }

      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
      });

      await fs.writeFile(filePath, response.data);
      logger.debug("Image downloaded", { fileName });

      return filePath;
    } catch (error) {
      logger.warn("Failed to download image", {
        imageUrl,
        message: (error as Error).message,
      });
      return null;
    }
  }

  private getExtension(url: string): string {
    const clean = url.split("?")[0];
    const ext = path.extname(clean).toLowerCase();
    // اگه پسوند معتبر نبود، پیش‌فرض jpg
    return /\.(jpg|jpeg|png|webp|gif)$/.test(ext) ? ext : ".jpg";
  }

  private sanitizeFileName(name: string): string {
    return name
      .trim()
      .replace(/[\\/:*?"<>|]/g, "-") // کاراکترهای غیرمجاز
      .replace(/\s+/g, "-")
      .slice(0, 100); // محدودیت طول نام
  }
}
