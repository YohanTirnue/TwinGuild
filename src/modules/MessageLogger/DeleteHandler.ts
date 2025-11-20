import { Message, TextChannel } from 'discord.js';
import { getCacheManager } from './CacheManager';
import { getLogger } from '../../utils/Logger';
import { getConfigManager } from '../../core/ConfigManager';
import fs from 'fs';

export class DeleteHandler {
  private cacheManager = getCacheManager();
  private logger = getLogger();
  private configManager = getConfigManager();

  /**
   * Handle message deletion
   */
  async handleDelete(message: Message): Promise<void> {
    try {
      // Ignore bot messages
      if (message.author?.bot) return;

      if (!message.guild) return;

      const serverId = message.guild.id;

      // Get server config
      const serverConfig = this.configManager.getServerConfig(serverId);
      if (!serverConfig) {
        this.logger.warn(`No configuration found for server ${serverId}`);
        return;
      }

      // Get log channel
      const logChannelId = serverConfig.logging.channels.message_log;
      if (!logChannelId) {
        this.logger.warn(`No message log channel configured for server ${serverId}`);
        return;
      }

      // Get log server
      const logServerId = serverConfig.logging.log_server_id;
      const logGuild = await message.client.guilds.fetch(logServerId);
      if (!logGuild) {
        this.logger.error(`Log server not found: ${logServerId}`);
        return;
      }

      const logChannel = await logGuild.channels.fetch(logChannelId) as TextChannel;
      if (!logChannel) {
        this.logger.error(`Log channel not found: ${logChannelId}`);
        return;
      }

      // Get cached message if content is empty (partial deletion)
      const cachedMessage = this.cacheManager.get(message.id);

      // If no cached message and the deleted message is a partial, we can't do much
      if (!cachedMessage && !message.content && !message.author) {
        this.logger.debug(`Uncached partial message deleted: ${message.id}`);
        return;
      }

      // Combine cached data with available message data
      const author = {
        id: cachedMessage?.author.id || message.author?.id || 'Unknown',
        username: cachedMessage?.author.username || message.author?.username || 'Unknown User',
      };

      const content = cachedMessage?.content || message.content || '*No content available*';
      const attachments = cachedMessage?.attachments || [];
      const urls = cachedMessage?.urls || [];
      const timestamp = cachedMessage?.timestamp || message.createdTimestamp;

      // Create log message
      let logMessage = `**MESSAGE DELETED**\n\n`;
      logMessage += `Username: ${author.username}\n`;
      logMessage += `User ID: ${author.id}\n`;
      logMessage += `Deleted message: ${content}\n`;
      logMessage += `\nMessage sent: <t:${Math.floor(timestamp / 1000)}:F>\n`;
      logMessage += `Message deleted: <t:${Math.floor(Date.now() / 1000)}:F>\n`;
      logMessage += `Channel: <#${message.channelId}>\n`;

      // Send the basic log message
      await logChannel.send({ content: logMessage });

      // Handle attachments (send as separate messages)
      if (attachments && attachments.length > 0) {
        const attachmentMsg = `**Attachments from deleted message by ${author.username}**\n`;
        await logChannel.send({ content: attachmentMsg });

        for (const attachment of attachments) {
          try {
            let fileSent = false;

            // Try to send saved file
            if (attachment.savedPath && fs.existsSync(attachment.savedPath)) {
              try {
                await logChannel.send({
                  content: `File: ${attachment.name} (${attachment.contentType || 'unknown type'})`,
                  files: [attachment.savedPath],
                });
                fileSent = true;
              } catch (error) {
                this.logger.error(`Error sending saved attachment:`, error);
              }
            }

            // If saved file failed, try original URL
            if (!fileSent && attachment.url) {
              try {
                await logChannel.send({
                  content: `File: ${attachment.name} (${attachment.contentType || 'unknown type'})`,
                  files: [attachment.url],
                });
                fileSent = true;
              } catch (error) {
                this.logger.error(`Error sending attachment from URL:`, error);
              }
            }

            // If both failed, send URL as text
            if (!fileSent) {
              await logChannel.send({
                content: `Unable to retrieve file: ${attachment.name}\nOriginal URL: ${attachment.url}`,
              });
            }
          } catch (error) {
            this.logger.error(`Error sending attachment log:`, error);
          }
        }
      }

      // Handle URLs in content
      if (urls && urls.length > 0) {
        let urlMsg = `**URLs from deleted message by ${author.username}**\n`;
        for (const url of urls) {
          urlMsg += `• ${url.url}\n`;
        }
        await logChannel.send({ content: urlMsg });
      }

      this.logger.debug(`Logged deletion for message ${message.id}`);
    } catch (error) {
      this.logger.error('Error handling message delete event:', error);
    }
  }
}
