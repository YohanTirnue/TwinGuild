import { StorageProvider } from '../../types';

/**
 * Abstract base class for storage providers
 */
export abstract class BaseStorageProvider implements StorageProvider {
  abstract uploadFile(filePath: string, key: string): Promise<string>;
  abstract downloadFile(key: string, destination: string): Promise<void>;
  abstract deleteFile(key: string): Promise<void>;
  abstract fileExists(key: string): Promise<boolean>;
  abstract getFileUrl(key: string): Promise<string>;

  /**
   * Generate a storage key from message ID and filename
   */
  protected generateKey(messageId: string, filename: string): string {
    return `${messageId}/${this.sanitizeFilename(filename)}`;
  }

  /**
   * Sanitize filename to remove dangerous characters
   */
  protected sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
  }

  /**
   * Extract filename from URL
   */
  protected extractFilename(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const parts = pathname.split('/');
      return parts[parts.length - 1] || 'download';
    } catch {
      return 'download';
    }
  }
}
