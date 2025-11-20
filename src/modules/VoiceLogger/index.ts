import { VoiceState } from 'discord.js';
import { VoiceStateHandler } from './StateHandler';
import { getLogger } from '../../utils/Logger';

export class VoiceLogger {
  private stateHandler = new VoiceStateHandler();
  private logger = getLogger();

  constructor() {
    this.logger.info('Voice logger initialized');
  }

  /**
   * Handle voice state update
   */
  async onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
    await this.stateHandler.handleVoiceStateUpdate(oldState, newState);
  }
}

// Singleton instance
let voiceLogger: VoiceLogger | null = null;

export function getVoiceLogger(): VoiceLogger {
  if (!voiceLogger) {
    voiceLogger = new VoiceLogger();
  }
  return voiceLogger;
}
