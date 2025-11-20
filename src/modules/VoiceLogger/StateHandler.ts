import { VoiceState, TextChannel } from 'discord.js';
import { getLogger } from '../../utils/Logger';
import { getConfigManager } from '../../core/ConfigManager';

export class VoiceStateHandler {
  private logger = getLogger();
  private configManager = getConfigManager();

  /**
   * Handle voice state update
   */
  async handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
    try {
      if (!newState.guild) return;

      const serverId = newState.guild.id;

      // Get server config
      const serverConfig = this.configManager.getServerConfig(serverId);
      if (!serverConfig) {
        this.logger.warn(`No configuration found for server ${serverId}`);
        return;
      }

      // Check if voice logging is enabled
      if (!serverConfig.features.voice_logging.enabled) {
        return;
      }

      // Get log channel
      const logChannelId = serverConfig.logging.channels.voice_log;
      if (!logChannelId) {
        this.logger.warn(`No voice log channel configured for server ${serverId}`);
        return;
      }

      // Get log server
      const logServerId = serverConfig.logging.log_server_id;
      const logGuild = await newState.client.guilds.fetch(logServerId);
      if (!logGuild) {
        this.logger.error(`Log server not found: ${logServerId}`);
        return;
      }

      const logChannel = await logGuild.channels.fetch(logChannelId) as TextChannel;
      if (!logChannel) {
        this.logger.error(`Log channel not found: ${logChannelId}`);
        return;
      }

      const member = newState.member || oldState.member;
      if (!member) return;

      const username = member.user.username;
      const userId = member.id;

      // User joined a voice channel
      if (!oldState.channelId && newState.channelId) {
        if (serverConfig.features.voice_logging.log_joins) {
          const logMessage = `**VOICE CHANNEL JOINED**\n\n` +
            `Username: ${username}\n` +
            `User ID: ${userId}\n` +
            `Channel: ${newState.channel?.name}\n` +
            `Time: <t:${Math.floor(Date.now() / 1000)}:F>`;

          await logChannel.send({ content: logMessage });
          this.logger.debug(`Logged voice join: ${username} -> ${newState.channel?.name}`);
        }
      }
      // User left a voice channel
      else if (oldState.channelId && !newState.channelId) {
        if (serverConfig.features.voice_logging.log_leaves) {
          const logMessage = `**VOICE CHANNEL LEFT**\n\n` +
            `Username: ${username}\n` +
            `User ID: ${userId}\n` +
            `Channel: ${oldState.channel?.name}\n` +
            `Time: <t:${Math.floor(Date.now() / 1000)}:F>`;

          await logChannel.send({ content: logMessage });
          this.logger.debug(`Logged voice leave: ${username} <- ${oldState.channel?.name}`);
        }
      }
      // User switched voice channels
      else if (oldState.channelId !== newState.channelId) {
        if (serverConfig.features.voice_logging.log_switches) {
          const logMessage = `**VOICE CHANNEL SWITCHED**\n\n` +
            `Username: ${username}\n` +
            `User ID: ${userId}\n` +
            `From: ${oldState.channel?.name}\n` +
            `To: ${newState.channel?.name}\n` +
            `Time: <t:${Math.floor(Date.now() / 1000)}:F>`;

          await logChannel.send({ content: logMessage });
          this.logger.debug(`Logged voice switch: ${username} ${oldState.channel?.name} -> ${newState.channel?.name}`);
        }
      }
      // User muted/unmuted
      else if (oldState.selfMute !== newState.selfMute) {
        if (serverConfig.features.voice_logging.log_mutes) {
          const action = newState.selfMute ? 'MUTED' : 'UNMUTED';
          const logMessage = `**VOICE ${action}**\n\n` +
            `Username: ${username}\n` +
            `User ID: ${userId}\n` +
            `Channel: ${newState.channel?.name}\n` +
            `Time: <t:${Math.floor(Date.now() / 1000)}:F>`;

          await logChannel.send({ content: logMessage });
          this.logger.debug(`Logged voice mute: ${username} ${action}`);
        }
      }
      // User deafened/undeafened
      else if (oldState.selfDeaf !== newState.selfDeaf) {
        if (serverConfig.features.voice_logging.log_deafens) {
          const action = newState.selfDeaf ? 'DEAFENED' : 'UNDEAFENED';
          const logMessage = `**VOICE ${action}**\n\n` +
            `Username: ${username}\n` +
            `User ID: ${userId}\n` +
            `Channel: ${newState.channel?.name}\n` +
            `Time: <t:${Math.floor(Date.now() / 1000)}:F>`;

          await logChannel.send({ content: logMessage });
          this.logger.debug(`Logged voice deafen: ${username} ${action}`);
        }
      }
    } catch (error) {
      this.logger.error('Error handling voice state update:', error);
    }
  }
}
