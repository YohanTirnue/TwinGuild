import { LRUCache } from 'lru-cache';
import { Message } from 'discord.js';
import { CachedMessage, CachedAttachment, CachedURL } from '../../types';
import { getLogger } from '../../utils/Logger';

export class MessageCacheManager {
  private cache: LRUCache<string, CachedMessage>;
  private logger = getLogger();

  constructor(maxSize: number = 200, ttlHours: number = 24) {
    this.cache = new LRUCache({
      max: maxSize,
      ttl: ttlHours * 60 * 60 * 1000, // Convert hours to milliseconds
      updateAgeOnGet: true,
      updateAgeOnHas: false,
    });

    this.logger.info(`Message cache initialized with max size: ${maxSize}, TTL: ${ttlHours} hours`);
  }

  /**
   * Add a message to the cache
   */
  async set(message: Message, attachments: CachedAttachment[] = [], urls: CachedURL[] = []): Promise<void> {
    try {
      const cached: CachedMessage = {
        id: message.id,
        content: message.content || '',
        author: {
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          avatar: message.author.avatar || undefined,
        },
        channelId: message.channelId,
        channelName: message.channel && 'name' in message.channel ? (message.channel.name || 'Unknown') : 'Unknown',
        guildId: message.guildId,
        attachments,
        urls,
        embeds: message.embeds.map(embed => embed.toJSON()),
        timestamp: message.createdTimestamp,
      };

      this.cache.set(message.id, cached);
      this.logger.debug(`Cached message ${message.id} from ${message.author.username}`);
    } catch (error) {
      this.logger.error(`Error caching message ${message.id}:`, error);
    }
  }

  /**
   * Get a cached message
   */
  get(messageId: string): CachedMessage | undefined {
    return this.cache.get(messageId);
  }

  /**
   * Check if a message is cached
   */
  has(messageId: string): boolean {
    return this.cache.has(messageId);
  }

  /**
   * Delete a message from cache
   */
  delete(messageId: string): boolean {
    return this.cache.delete(messageId);
  }

  /**
   * Clear all cached messages
   */
  clear(): void {
    this.cache.clear();
    this.logger.info('Message cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; max: number; hitRate: number } {
    return {
      size: this.cache.size,
      max: this.cache.max,
      hitRate: 0, // LRU cache doesn't track hit rate by default
    };
  }

  /**
   * Get current cache size
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * Get all cached messages for a specific guild
   */
  getMessagesForGuild(guildId: string): CachedMessage[] {
    const messages: CachedMessage[] = [];

    for (const [, message] of this.cache.entries()) {
      if (message.guildId === guildId) {
        messages.push(message);
      }
    }

    return messages;
  }

  /**
   * Get all cached messages for a specific channel
   */
  getMessagesForChannel(channelId: string): CachedMessage[] {
    const messages: CachedMessage[] = [];

    for (const [, message] of this.cache.entries()) {
      if (message.channelId === channelId) {
        messages.push(message);
      }
    }

    return messages;
  }

  /**
   * Get all cached messages from a specific user
   */
  getMessagesFromUser(userId: string): CachedMessage[] {
    const messages: CachedMessage[] = [];

    for (const [, message] of this.cache.entries()) {
      if (message.author.id === userId) {
        messages.push(message);
      }
    }

    return messages;
  }
}

// Singleton instance
let cacheManager: MessageCacheManager | null = null;

export function getCacheManager(maxSize?: number, ttlHours?: number): MessageCacheManager {
  if (!cacheManager) {
    cacheManager = new MessageCacheManager(maxSize, ttlHours);
  }
  return cacheManager;
}
