import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { logger } from "../utils/logger";

export class ImageService {
  private imagesDir = path.resolve(process.cwd(), "exports", "images");

  constructor() {
    fs.ensureDirSync(this.imagesDir);
  }

  /**
   * نام فایل امن می‌سازد. اولویت با nameEn است،
   * در صورت نبود از id استفاده می‌کند تا تداخل پیش نیاید.
   */
  private buildFileName(nameEn: string | undefined, id: number, ext: string): string {
    const safeName = (nameEn ?? `product-${id}`)
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();

    // برای جلوگیری از overwrite شدن (چون nameEn ممکنه تکراری باشه مثل Umbrella)
    return `${safeName}-${id}${ext}`;
  }

  private getExtension(url: string): string {
    const match = url.split("?")[0].match(/\.(jpg|jpeg|png|webp|gif)$/i);
    return match ? `.${match[1].toLowerCase()}` : ".jpg";
  }

  /**
   * دانلود تصویر و برگرداندن مسیر کامل (absolute path)
   */
  public async download(
    url: string | undefined,
    nameEn: string | undefined,
    id: number
  ): Promise<string> {
    if (!url) return "";

    try {
      const ext = this.getExtension(url);
      const fileName = this.buildFileName(nameEn, id, ext);
      const filePath = path.join(this.imagesDir, fileName);

      // اگر قبلاً دانلود شده، دوباره دانلود نکن
      if (await fs.pathExists(filePath)) {
        return filePath;
      }

      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 30000,
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      await fs.writeFile(filePath, response.data);
      logger.debug("Image downloaded", { id, file: fileName });

      return filePath;
    } catch (error) {
      logger.warn("Image download failed", {
        id,
        url,
        error: (error as Error).message,
      });
      return "";
    }
  }
}

export const imageService = new ImageService();
