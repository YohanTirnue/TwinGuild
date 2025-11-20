import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { BaseStorageProvider } from './StorageProvider';
import { getLogger } from '../../utils/Logger';

export class LocalStorageProvider extends BaseStorageProvider {
  private basePath: string;
  private logger = getLogger();

  constructor(basePath: string = './stored_files') {
    super();
    this.basePath = basePath;
    this.ensureBasePath();
  }

  /**
   * Ensure base storage path exists
   */
  private ensureBasePath(): void {
    if (!fsSync.existsSync(this.basePath)) {
      fsSync.mkdirSync(this.basePath, { recursive: true });
      this.logger.info(`Created storage directory: ${this.basePath}`);
    }
  }

  /**
   * Upload file to local storage
   */
  async uploadFile(filePath: string, key: string): Promise<string> {
    try {
      const destination = path.join(this.basePath, key);
      const directory = path.dirname(destination);

      // Ensure directory exists
      await fs.mkdir(directory, { recursive: true });

      // Copy file to destination
      await fs.copyFile(filePath, destination);

      this.logger.debug(`Uploaded file to local storage: ${key}`);
      return destination;
    } catch (error) {
      this.logger.error(`Error uploading file to local storage:`, error);
      throw error;
    }
  }

  /**
   * Download file from local storage (essentially a copy operation)
   */
  async downloadFile(key: string, destination: string): Promise<void> {
    try {
      const sourcePath = path.join(this.basePath, key);

      // Ensure source exists
      const exists = await this.fileExists(key);
      if (!exists) {
        throw new Error(`File not found: ${key}`);
      }

      // Ensure destination directory exists
      const destDir = path.dirname(destination);
      await fs.mkdir(destDir, { recursive: true });

      // Copy file
      await fs.copyFile(sourcePath, destination);

      this.logger.debug(`Downloaded file from local storage: ${key}`);
    } catch (error) {
      this.logger.error(`Error downloading file from local storage:`, error);
      throw error;
    }
  }

  /**
   * Delete file from local storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const filePath = path.join(this.basePath, key);

      const exists = await this.fileExists(key);
      if (!exists) {
        this.logger.warn(`File not found for deletion: ${key}`);
        return;
      }

      await fs.unlink(filePath);
      this.logger.debug(`Deleted file from local storage: ${key}`);

      // Try to remove empty directories
      await this.cleanupEmptyDirectories(path.dirname(filePath));
    } catch (error) {
      this.logger.error(`Error deleting file from local storage:`, error);
      throw error;
    }
  }

  /**
   * Check if file exists in local storage
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.basePath, key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file URL (local file path)
   */
  async getFileUrl(key: string): Promise<string> {
    const filePath = path.join(this.basePath, key);
    return `file://${path.resolve(filePath)}`;
  }

  /**
   * Get absolute file path
   */
  getFilePath(key: string): string {
    return path.join(this.basePath, key);
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{ totalFiles: number; totalSizeBytes: number }> {
    let totalFiles = 0;
    let totalSizeBytes = 0;

    try {
      const files = await this.getAllFiles(this.basePath);

      for (const file of files) {
        const stats = await fs.stat(file);
        if (stats.isFile()) {
          totalFiles++;
          totalSizeBytes += stats.size;
        }
      }
    } catch (error) {
      this.logger.error('Error getting storage stats:', error);
    }

    return { totalFiles, totalSizeBytes };
  }

  /**
   * Recursively get all files in a directory
   */
  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.getAllFiles(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.logger.error(`Error reading directory ${dir}:`, error);
    }

    return files;
  }

  /**
   * Clean up empty directories
   */
  private async cleanupEmptyDirectories(dir: string): Promise<void> {
    try {
      // Don't remove the base path
      if (dir === this.basePath || !dir.startsWith(this.basePath)) {
        return;
      }

      const entries = await fs.readdir(dir);

      if (entries.length === 0) {
        await fs.rmdir(dir);
        this.logger.debug(`Removed empty directory: ${dir}`);

        // Recursively check parent directory
        await this.cleanupEmptyDirectories(path.dirname(dir));
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
  }
}
