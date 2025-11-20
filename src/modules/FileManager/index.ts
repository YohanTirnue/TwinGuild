import path from 'path';
import { Message, Attachment } from 'discord.js';
import { BaseStorageProvider } from './StorageProvider';
import { LocalStorageProvider } from './LocalStorage';
import { FileDownloader, getFileDownloader } from './Downloader';
import { URLExtractor } from './URLExtractor';
import { CachedAttachment, CachedURL } from '../../types';
import { getLogger } from '../../utils/Logger';
import { getConfigManager } from '../../core/ConfigManager';

export class FileManager {
  private storage: BaseStorageProvider;
  private downloader: FileDownloader;
  private logger = getLogger();
  private configManager = getConfigManager();

  constructor(storageProvider?: BaseStorageProvider) {
    // Use provided storage or create default local storage
    if (storageProvider) {
      this.storage = storageProvider;
    } else {
      const config = this.configManager.getBotConfig();
      const storagePath = config?.storage.local.path || './stored_files';
      this.storage = new LocalStorageProvider(storagePath);
    }

    // Initialize downloader with config
    const config = this.configManager.getBotConfig();
    this.downloader = getFileDownloader(
      config?.storage.files.max_size_mb,
      config?.storage.files.timeout_ms,
      config?.storage.files.retry_attempts,
      config?.storage.files.retry_delay_ms
    );

    this.logger.info('File manager initialized');
  }

  /**
   * Process and save all attachments from a message
   */
  async processMessageAttachments(message: Message): Promise<CachedAttachment[]> {
    const cachedAttachments: CachedAttachment[] = [];

    if (!message.attachments || message.attachments.size === 0) {
      return cachedAttachments;
    }

    for (const [id, attachment] of message.attachments) {
      try {
        const cached = await this.processAttachment(message.id, attachment);
        cachedAttachments.push(cached);
      } catch (error) {
        this.logger.error(`Error processing attachment ${id}:`, error);

        // Still add to cache even if download fails
        cachedAttachments.push({
          id: attachment.id,
          url: attachment.url,
          name: attachment.name || `attachment_${id}`,
          contentType: attachment.contentType || 'unknown',
          size: attachment.size,
          savedPath: null,
        });
      }
    }

    return cachedAttachments;
  }

  /**
   * Process and save URLs from message content
   */
  async processMessageUrls(messageId: string, content: string): Promise<CachedURL[]> {
    const cachedUrls: CachedURL[] = [];

    if (!content) {
      return cachedUrls;
    }

    // Extract URLs
    const urls = URLExtractor.extractUrls(content);

    if (urls.length === 0) {
      return cachedUrls;
    }

    const config = this.configManager.getBotConfig();
    const allowedExtensions = config?.storage.url_file_extensions || [];

    for (const url of urls) {
      try {
        // Check if URL is a direct file link
        const isDownloadable = this.downloader.isDownloadableUrl(url, allowedExtensions);

        if (isDownloadable) {
          // Download the file
          const filename = await this.downloader.getFilename(url, 'url_content');
          const tempPath = path.join('./temp', messageId, filename);
          const downloadedPath = await this.downloader.downloadFile(url, tempPath);

          if (downloadedPath) {
            // Upload to storage
            const storageKey = `${messageId}/${filename}`;
            const savedPath = await this.storage.uploadFile(downloadedPath, storageKey);

            cachedUrls.push({
              url,
              savedPath,
            });
          } else {
            cachedUrls.push({ url, savedPath: null });
          }
        } else {
          // Just store the URL without downloading
          cachedUrls.push({ url, savedPath: null });
        }
      } catch (error) {
        this.logger.error(`Error processing URL ${url}:`, error);
        cachedUrls.push({ url, savedPath: null });
      }
    }

    return cachedUrls;
  }

  /**
   * Process a single attachment
   */
  private async processAttachment(messageId: string, attachment: Attachment): Promise<CachedAttachment> {
    const filename = attachment.name || `attachment_${attachment.id}`;
    const tempPath = path.join('./temp', messageId, filename);

    // Download attachment
    const downloadedPath = await this.downloader.downloadFile(attachment.url, tempPath);

    let savedPath: string | null = null;

    if (downloadedPath) {
      try {
        // Upload to storage
        const storageKey = `${messageId}/${filename}`;
        savedPath = await this.storage.uploadFile(downloadedPath, storageKey);
      } catch (error) {
        this.logger.error(`Error uploading file to storage:`, error);
      }
    }

    return {
      id: attachment.id,
      url: attachment.url,
      name: filename,
      contentType: attachment.contentType || 'unknown',
      size: attachment.size,
      savedPath,
    };
  }

  /**
   * Get file from storage (for re-uploading deleted message attachments)
   */
  async getFile(messageId: string, filename: string): Promise<string | null> {
    try {
      const storageKey = `${messageId}/${filename}`;
      const exists = await this.storage.fileExists(storageKey);

      if (!exists) {
        this.logger.warn(`File not found in storage: ${storageKey}`);
        return null;
      }

      // For local storage, we can return the path directly
      if (this.storage instanceof LocalStorageProvider) {
        return this.storage.getFilePath(storageKey);
      }

      // For other storage providers, we might need to download to temp location
      const tempPath = path.join('./temp', 'retrieval', messageId, filename);
      await this.storage.downloadFile(storageKey, tempPath);
      return tempPath;
    } catch (error) {
      this.logger.error(`Error getting file from storage:`, error);
      return null;
    }
  }

  /**
   * Delete all files associated with a message
   */
  async deleteMessageFiles(messageId: string): Promise<void> {
    try {
      // This would need to be implemented based on how we track files per message
      // For now, we'll keep files for the retention period
      this.logger.debug(`Deletion requested for message ${messageId} files`);
    } catch (error) {
      this.logger.error(`Error deleting message files:`, error);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{ totalFiles: number; totalSizeBytes: number }> {
    if (this.storage instanceof LocalStorageProvider) {
      return this.storage.getStats();
    }

    return { totalFiles: 0, totalSizeBytes: 0 };
  }
}

// Singleton instance
let fileManager: FileManager | null = null;

export function getFileManager(storageProvider?: BaseStorageProvider): FileManager {
  if (!fileManager) {
    fileManager = new FileManager(storageProvider);
  }
  return fileManager;
}

export { URLExtractor } from './URLExtractor';
