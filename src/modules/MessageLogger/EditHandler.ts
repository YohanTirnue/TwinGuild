import { Message, TextChannel } from 'discord.js';
import { getLogger } from '../../utils/Logger';
import { getConfigManager } from '../../core/ConfigManager';

export class EditHandler {
  private logger = getLogger();
  private configManager = getConfigManager();

  /**
   * Handle message edit
   */
  async handleEdit(oldMessage: Message, newMessage: Message): Promise<void> {
    try {
      // Ignore bot messages
      if (newMessage.author?.bot) return;

      if (!newMessage.guild) return;

      const serverId = newMessage.guild.id;

      // Get server config
      const serverConfig = this.configManager.getServerConfig(serverId);
      if (!serverConfig) {
        this.logger.warn(`No configuration found for server ${serverId}`);
        return;
      }

      // Check if edit logging is enabled
      if (!serverConfig.features.message_logging.log_edits) {
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
      const logGuild = await newMessage.client.guilds.fetch(logServerId);
      if (!logGuild) {
        this.logger.error(`Log server not found: ${logServerId}`);
        return;
      }

      const logChannel = await logGuild.channels.fetch(logChannelId) as TextChannel;
      if (!logChannel) {
        this.logger.error(`Log channel not found: ${logChannelId}`);
        return;
      }

      // Create log message
      let logMessage = `**MESSAGE EDITED**\n\n`;
      logMessage += `Username: ${newMessage.author.username}\n`;
      logMessage += `User ID: ${newMessage.author.id}\n`;
      logMessage += `Before: ${oldMessage.content || '*No content available*'}\n`;
      logMessage += `After: ${newMessage.content || '*No content available*'}\n`;
      logMessage += `\nEdited at: <t:${Math.floor(Date.now() / 1000)}:F>\n`;
      logMessage += `Channel: <#${newMessage.channelId}>\n`;
      logMessage += `[Jump to Message](${newMessage.url})\n`;

      // Send log message
      await logChannel.send({ content: logMessage });

      this.logger.debug(`Logged edit for message ${newMessage.id}`);
    } catch (error) {
      this.logger.error('Error handling message update event:', error);
    }
  }
}
