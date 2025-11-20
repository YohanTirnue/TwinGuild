import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { getLogger } from '../../utils/Logger';

export class FileDownloader {
  private logger = getLogger();
  private maxFileSize: number;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(
    maxFileSizeMB: number = 25,
    timeoutMs: number = 30000,
    retryAttempts: number = 3,
    retryDelayMs: number = 1000
  ) {
    this.maxFileSize = maxFileSizeMB * 1024 * 1024; // Convert to bytes
    this.timeout = timeoutMs;
    this.retryAttempts = retryAttempts;
    this.retryDelay = retryDelayMs;
  }

  /**
   * Download a file from a URL
   */
  async downloadFile(
    url: string,
    destination: string,
    attempt: number = 0
  ): Promise<string | null> {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destination);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      this.logger.debug(`Downloading file from: ${url}`);

      // Download file
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: this.timeout,
        maxContentLength: this.maxFileSize,
        maxBodyLength: this.maxFileSize,
      });

      // Check content length
      const contentLength = parseInt(response.headers['content-length'] || '0');
      if (contentLength > this.maxFileSize) {
        throw new Error(`File too large: ${contentLength} bytes (max: ${this.maxFileSize} bytes)`);
      }

      // Create write stream
      const writer = fs.createWriteStream(destination);

      // Pipe response to file
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          this.logger.debug(`File downloaded successfully: ${destination}`);
          resolve(destination);
        });

        writer.on('error', (error) => {
          this.logger.error(`Error writing file:`, error);
          reject(error);
        });

        response.data.on('error', (error: Error) => {
          this.logger.error(`Error downloading file:`, error);
          reject(error);
        });
      });
    } catch (error: any) {
      this.logger.error(`Error downloading file (attempt ${attempt + 1}):`, error.message);

      // Retry logic
      if (attempt < this.retryAttempts - 1) {
        this.logger.info(`Retrying download in ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay);
        return this.downloadFile(url, destination, attempt + 1);
      }

      // Delete partial file if it exists
      if (fs.existsSync(destination)) {
        try {
          fs.unlinkSync(destination);
        } catch {
          // Ignore cleanup errors
        }
      }

      return null;
    }
  }

  /**
   * Download multiple files concurrently
   */
  async downloadFiles(
    files: Array<{ url: string; destination: string }>,
    concurrency: number = 5
  ): Promise<Array<{ url: string; destination: string; success: boolean; path: string | null }>> {
    const results: Array<{ url: string; destination: string; success: boolean; path: string | null }> = [];
    const queue = [...files];

    // Process files in batches
    while (queue.length > 0) {
      const batch = queue.splice(0, concurrency);
      const promises = batch.map(async (file) => {
        const path = await this.downloadFile(file.url, file.destination);
        return {
          url: file.url,
          destination: file.destination,
          success: path !== null,
          path,
        };
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Check if a URL points to a downloadable file
   */
  isDownloadableUrl(url: string, allowedExtensions: string[]): boolean {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();

      return allowedExtensions.some(ext => pathname.endsWith(ext.toLowerCase()));
    } catch {
      return false;
    }
  }

  /**
   * Get filename from URL or content-disposition header
   */
  async getFilename(url: string, defaultName: string = 'download'): Promise<string> {
    try {
      // Try to get filename from URL first
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const urlFilename = path.basename(pathname);

      if (urlFilename && urlFilename !== '/') {
        return this.sanitizeFilename(urlFilename);
      }

      // Try to get filename from content-disposition header
      const response = await axios.head(url, { timeout: 5000 });
      const contentDisposition = response.headers['content-disposition'];

      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          return this.sanitizeFilename(match[1].replace(/['"]/g, ''));
        }
      }

      // Fallback to default name with extension from content-type
      const contentType = response.headers['content-type'];
      if (contentType) {
        const ext = this.getExtensionFromContentType(contentType);
        return `${defaultName}${ext}`;
      }

      return defaultName;
    } catch {
      return defaultName;
    }
  }

  /**
   * Sanitize filename
   */
  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
  }

  /**
   * Get file extension from content type
   */
  private getExtensionFromContentType(contentType: string): string {
    const types: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
      'application/pdf': '.pdf',
      'application/zip': '.zip',
      'text/plain': '.txt',
    };

    const baseType = contentType.split(';')[0].trim();
    return types[baseType] || '';
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let downloader: FileDownloader | null = null;

export function getFileDownloader(
  maxFileSizeMB?: number,
  timeoutMs?: number,
  retryAttempts?: number,
  retryDelayMs?: number
): FileDownloader {
  if (!downloader) {
    downloader = new FileDownloader(maxFileSizeMB, timeoutMs, retryAttempts, retryDelayMs);
  }
  return downloader;
}
