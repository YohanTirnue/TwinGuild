import { Client, GatewayIntentBits, Partials, Message, PartialMessage, VoiceState } from 'discord.js';
import { EventEmitter } from 'events';
import { getLogger } from '../utils/Logger';
import { getConfigManager } from './ConfigManager';
import { BotConfig } from '../types';

export class BotClient extends EventEmitter {
  public client: Client;
  private logger = getLogger();
  private configManager = getConfigManager();
  private botConfig: BotConfig | null = null;
  private isReady: boolean = false;

  constructor() {
    super();

    // Create Discord client with necessary intents
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.User,
        Partials.GuildMember,
      ],
    });

    this.setupEventHandlers();
  }

  /**
   * Initialize the bot
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Discord bot...');

      // Load configuration
      const env = process.env.NODE_ENV || 'default';
      this.botConfig = await this.configManager.loadBotConfig(env);
      await this.configManager.loadServerConfigs();

      this.logger.info('Configuration loaded successfully');
    } catch (error) {
      this.logger.error('Failed to initialize bot:', error);
      throw error;
    }
  }

  /**
   * Login to Discord
   */
  async login(): Promise<void> {
    try {
      const token = process.env.DISCORD_BOT_TOKEN;

      if (!token) {
        throw new Error('DISCORD_BOT_TOKEN environment variable is not set');
      }

      this.logger.info('Logging in to Discord...');
      await this.client.login(token);
    } catch (error) {
      this.logger.error('Failed to login to Discord:', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down bot...');

    try {
      this.client.destroy();
      this.isReady = false;
      this.logger.info('Bot shut down successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Check if bot is ready
   */
  public ready(): boolean {
    return this.isReady;
  }

  /**
   * Get bot configuration
   */
  public getConfig(): BotConfig | null {
    return this.botConfig;
  }

  /**
   * Setup Discord event handlers
   */
  private setupEventHandlers(): void {
    // Ready event
    this.client.once('ready', async () => {
      this.isReady = true;
      this.logger.info(`Logged in as ${this.client.user?.tag}!`);
      this.logger.info(`Serving in ${this.client.guilds.cache.size} servers`);

      // Set bot status
      if (this.botConfig?.bot.status) {
        const { type, text } = this.botConfig.bot.status;
        const activityType = this.getActivityType(type);

        this.client.user?.setActivity(text, { type: activityType });
      }

      this.emit('ready');
    });

    // Message create event
    this.client.on('messageCreate', (message: Message) => {
      // Skip if message is from an ignored user/channel
      if (this.shouldIgnoreMessage(message)) {
        return;
      }

      this.emit('messageCreate', message);
    });

    // Message delete event
    this.client.on('messageDelete', (message: Message | PartialMessage) => {
      if (this.shouldIgnoreMessage(message as Message)) {
        return;
      }

      this.emit('messageDelete', message);
    });

    // Message update event
    this.client.on('messageUpdate', (oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) => {
      if (this.shouldIgnoreMessage(newMessage as Message)) {
        return;
      }

      // Ignore if content hasn't changed (embed loading, etc.)
      if (oldMessage.content === newMessage.content) {
        return;
      }

      this.emit('messageUpdate', oldMessage, newMessage);
    });

    // Voice state update event
    this.client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
      if (!newState.guild) {
        return;
      }

      // Check if voice logging is enabled for this server
      const isMonitored = this.configManager.isServerMonitored(newState.guild.id);
      if (!isMonitored) {
        return;
      }

      this.emit('voiceStateUpdate', oldState, newState);
    });

    // Error event
    this.client.on('error', (error: Error) => {
      this.logger.error('Discord client error:', error);
      this.emit('error', error);
    });

    // Warning event
    this.client.on('warn', (warning: string) => {
      this.logger.warn('Discord client warning:', warning);
    });

    // Disconnect event
    this.client.on('shardDisconnect', (event, shardId) => {
      this.logger.warn(`Shard ${shardId} disconnected:`, event);
    });

    // Reconnecting event
    this.client.on('shardReconnecting', (shardId) => {
      this.logger.info(`Shard ${shardId} reconnecting...`);
    });

    // Resume event
    this.client.on('shardResume', (shardId) => {
      this.logger.info(`Shard ${shardId} resumed`);
    });
  }

  /**
   * Check if a message should be ignored based on filters
   */
  private shouldIgnoreMessage(message: Message): boolean {
    if (!message.guild) {
      return true; // Ignore DMs
    }

    const serverId = message.guild.id;

    // Check if server is being monitored
    if (!this.configManager.isServerMonitored(serverId)) {
      return true;
    }

    // Check if channel should be ignored
    if (this.configManager.shouldIgnoreChannel(serverId, message.channelId)) {
      return true;
    }

    // Check if user should be ignored
    if (message.author && this.configManager.shouldIgnoreUser(
      serverId,
      message.author.id,
      message.author.bot
    )) {
      return true;
    }

    return false;
  }

  /**
   * Convert activity type string to Discord activity type
   */
  private getActivityType(type: string): number {
    const types: Record<string, number> = {
      'playing': 0,
      'streaming': 1,
      'listening': 2,
      'watching': 3,
      'competing': 5,
    };

    return types[type.toLowerCase()] ?? 0;
  }
}
