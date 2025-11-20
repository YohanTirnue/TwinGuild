import { Message } from 'discord.js';
import { getCacheManager } from './CacheManager';
import { DeleteHandler } from './DeleteHandler';
import { EditHandler } from './EditHandler';
import { getFileManager } from '../FileManager';
import { getLogger } from '../../utils/Logger';
import { getConfigManager } from '../../core/ConfigManager';

export class MessageLogger {
  private cacheManager = getCacheManager();
  private fileManager = getFileManager();
  private deleteHandler = new DeleteHandler();
  private editHandler = new EditHandler();
  private logger = getLogger();
  private configManager = getConfigManager();

  constructor() {
    this.logger.info('Message logger initialized');
  }

  /**
   * Initialize message logger (load existing messages into cache)
   */
  async initialize(client: any): Promise<void> {
    try {
      this.logger.info('Initializing message cache...');

      const serverConfigs = this.configManager.getAllServerConfigs();

      for (const serverConfig of serverConfigs) {
        if (!serverConfig.enabled) {
          continue;
        }

        try {
          const guild = await client.guilds.fetch(serverConfig.id);
          if (!guild) {
            this.logger.warn(`Guild not found: ${serverConfig.id}`);
            continue;
          }

          this.logger.info(`Loading messages from ${guild.name}...`);

          // Get all text channels
          const channels = guild.channels.cache.filter((c: any) => c.type === 0); // 0 = TextChannel

          let totalCached = 0;
          for (const [id, channel] of channels) {
            try {
              // Skip if channel should be ignored
              if (this.configManager.shouldIgnoreChannel(serverConfig.id, id)) {
                continue;
              }

              // Fetch last messages from each channel
              const messages = await (channel as any).messages.fetch({ limit: 50 });
              this.logger.debug(`Caching ${messages.size} messages from ${(channel as any).name}...`);

              for (const [, message] of messages) {
                await this.cacheMessage(message);
                totalCached++;
              }
            } catch (error) {
              this.logger.error(`Error fetching messages from channel ${(channel as any).name}:`, error);
            }
          }

          this.logger.info(`✅ Cached ${totalCached} messages from ${guild.name}`);
        } catch (error) {
          this.logger.error(`Error loading messages for server ${serverConfig.id}:`, error);
        }
      }

      this.logger.info('Message cache initialization complete');
    } catch (error) {
      this.logger.error('Error initializing message logger:', error);
      throw error;
    }
  }

  /**
   * Cache a message with attachments and URLs
   */
  async cacheMessage(message: Message): Promise<void> {
    try {
      // Skip bot messages
      if (message.author?.bot) return;

      if (!message.guild) return;

      // Get server config
      const serverConfig = this.configManager.getServerConfig(message.guild.id);
      if (!serverConfig || !serverConfig.features.message_logging.enabled) {
        return;
      }

      // Process attachments if enabled
      let attachments: any[] = [];
      if (serverConfig.features.message_logging.preserve_attachments) {
        attachments = await this.fileManager.processMessageAttachments(message);
      }

      // Process URLs if enabled
      let urls: any[] = [];
      if (serverConfig.features.message_logging.extract_urls) {
        urls = await this.fileManager.processMessageUrls(message.id, message.content);
      }

      // Add to cache
      await this.cacheManager.set(message, attachments, urls);
    } catch (error) {
      this.logger.error('Error caching message:', error);
    }
  }

  /**
   * Handle message creation (add to cache)
   */
  async onMessageCreate(message: Message): Promise<void> {
    await this.cacheMessage(message);
  }

  /**
   * Handle message deletion
   */
  async onMessageDelete(message: Message): Promise<void> {
    await this.deleteHandler.handleDelete(message);
  }

  /**
   * Handle message edit
   */
  async onMessageUpdate(oldMessage: Message, newMessage: Message): Promise<void> {
    // Cache the updated message
    await this.cacheMessage(newMessage);

    // Log the edit
    await this.editHandler.handleEdit(oldMessage, newMessage);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cacheManager.getStats();
  }
}

// Singleton instance
let messageLogger: MessageLogger | null = null;

export function getMessageLogger(): MessageLogger {
  if (!messageLogger) {
    messageLogger = new MessageLogger();
  }
  return messageLogger;
}

export { getCacheManager } from './CacheManager';
