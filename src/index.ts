import dotenv from 'dotenv';
import { BotClient } from './core/BotClient';
import { getMessageLogger } from './modules/MessageLogger';
import { getVoiceLogger } from './modules/VoiceLogger';
import { getLogger } from './utils/Logger';

// Load environment variables
dotenv.config();

const logger = getLogger();

/**
 * Main application entry point
 */
async function main() {
  try {
    logger.info('=================================');
    logger.info('TwinGuild Discord Bot v2.0');
    logger.info('=================================');

    // Create bot client
    const botClient = new BotClient();

    // Initialize bot (load configs)
    await botClient.initialize();

    // Create module instances
    const messageLogger = getMessageLogger();
    const voiceLogger = getVoiceLogger();

    // Register event handlers
    botClient.on('ready', async () => {
      logger.info('Bot is ready! Initializing modules...');

      // Initialize message cache
      await messageLogger.initialize(botClient.client);

      logger.info('All modules initialized successfully');
      logger.info('Bot is now fully operational');
    });

    botClient.on('messageCreate', async (message) => {
      await messageLogger.onMessageCreate(message);
    });

    botClient.on('messageDelete', async (message) => {
      await messageLogger.onMessageDelete(message);
    });

    botClient.on('messageUpdate', async (oldMessage, newMessage) => {
      await messageLogger.onMessageUpdate(oldMessage, newMessage);
    });

    botClient.on('voiceStateUpdate', async (oldState, newState) => {
      await voiceLogger.onVoiceStateUpdate(oldState, newState);
    });

    botClient.on('error', (error) => {
      logger.error('Bot error:', error);
    });

    // Login to Discord
    await botClient.login();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT signal, shutting down gracefully...');
      await botClient.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM signal, shutting down gracefully...');
      await botClient.shutdown();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('Failed to start bot:', error);
  process.exit(1);
});
