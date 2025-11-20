import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { BotConfig, ServerConfig } from '../types';

export class ConfigManager {
  private botConfig: BotConfig | null = null;
  private serverConfigs: Map<string, ServerConfig> = new Map();
  private configPath: string;

  constructor(configPath: string = './config') {
    this.configPath = configPath;
  }

  /**
   * Load bot configuration from YAML file
   */
  async loadBotConfig(environment: string = 'default'): Promise<BotConfig> {
    try {
      const configFile = path.join(this.configPath, `${environment}.yml`);

      if (!fs.existsSync(configFile)) {
        throw new Error(`Configuration file not found: ${configFile}`);
      }

      const fileContents = fs.readFileSync(configFile, 'utf8');
      this.botConfig = yaml.parse(fileContents) as BotConfig;

      // Validate required fields
      this.validateBotConfig(this.botConfig);

      return this.botConfig;
    } catch (error) {
      throw new Error(`Failed to load bot configuration: ${error}`);
    }
  }

  /**
   * Load server configurations from YAML file
   */
  async loadServerConfigs(): Promise<Map<string, ServerConfig>> {
    try {
      const serversFile = path.join(this.configPath, 'servers.yml');

      if (!fs.existsSync(serversFile)) {
        console.warn('No servers.yml found, using empty server configuration');
        return this.serverConfigs;
      }

      const fileContents = fs.readFileSync(serversFile, 'utf8');
      const parsed = yaml.parse(fileContents) as { servers: ServerConfig[] };

      if (parsed.servers && Array.isArray(parsed.servers)) {
        for (const server of parsed.servers) {
          this.serverConfigs.set(server.id, server);
        }
      }

      return this.serverConfigs;
    } catch (error) {
      throw new Error(`Failed to load server configurations: ${error}`);
    }
  }

  /**
   * Get bot configuration
   */
  getBotConfig(): BotConfig {
    if (!this.botConfig) {
      throw new Error('Bot configuration not loaded. Call loadBotConfig() first.');
    }
    return this.botConfig;
  }

  /**
   * Get server configuration by ID
   */
  getServerConfig(serverId: string): ServerConfig | undefined {
    return this.serverConfigs.get(serverId);
  }

  /**
   * Get all server configurations
   */
  getAllServerConfigs(): ServerConfig[] {
    return Array.from(this.serverConfigs.values());
  }

  /**
   * Check if a server is being monitored
   */
  isServerMonitored(serverId: string): boolean {
    const config = this.serverConfigs.get(serverId);
    return config ? config.enabled : false;
  }

  /**
   * Get feature flag for a server (with fallback to global config)
   */
  getFeature(serverId: string, feature: string): boolean {
    const serverConfig = this.serverConfigs.get(serverId);

    if (!serverConfig || !this.botConfig) {
      return false;
    }

    // Try to get server-specific feature flag
    const serverFeature = this.getNestedProperty(serverConfig.features, feature);
    if (serverFeature !== undefined) {
      return serverFeature;
    }

    // Fallback to global config
    return this.getNestedProperty(this.botConfig.features, feature) ?? false;
  }

  /**
   * Check if a channel should be ignored for a server
   */
  shouldIgnoreChannel(serverId: string, channelId: string): boolean {
    const config = this.serverConfigs.get(serverId);
    if (!config) return false;

    // Check if only specific channels should be monitored
    if (config.filters.monitor_only_channels.length > 0) {
      return !config.filters.monitor_only_channels.includes(channelId);
    }

    // Check if channel is in ignore list
    return config.filters.ignore_channels.includes(channelId);
  }

  /**
   * Check if a user should be ignored for a server
   */
  shouldIgnoreUser(serverId: string, userId: string, isBot: boolean = false): boolean {
    const config = this.serverConfigs.get(serverId);
    if (!config) return false;

    // Check if bots should be ignored
    if (isBot && config.filters.ignore_bots) {
      return true;
    }

    // Check if only specific users should be monitored
    if (config.filters.monitor_only_users.length > 0) {
      return !config.filters.monitor_only_users.includes(userId);
    }

    // Check if user is in ignore list
    return config.filters.ignore_users.includes(userId);
  }

  /**
   * Update server configuration (runtime)
   */
  updateServerConfig(serverId: string, config: Partial<ServerConfig>): void {
    const existing = this.serverConfigs.get(serverId);
    if (existing) {
      this.serverConfigs.set(serverId, { ...existing, ...config });
    }
  }

  /**
   * Save server configurations to file
   */
  async saveServerConfigs(): Promise<void> {
    try {
      const serversFile = path.join(this.configPath, 'servers.yml');
      const servers = Array.from(this.serverConfigs.values());
      const yamlContent = yaml.stringify({ servers });

      fs.writeFileSync(serversFile, yamlContent, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save server configurations: ${error}`);
    }
  }

  /**
   * Reload all configurations
   */
  async reload(): Promise<void> {
    const env = process.env.NODE_ENV || 'default';
    await this.loadBotConfig(env);
    await this.loadServerConfigs();
  }

  /**
   * Validate bot configuration
   */
  private validateBotConfig(config: BotConfig): void {
    if (!config.bot) {
      throw new Error('Missing required field: bot');
    }
    if (!config.storage) {
      throw new Error('Missing required field: storage');
    }
    if (!config.features) {
      throw new Error('Missing required field: features');
    }
  }

  /**
   * Get nested property from object using dot notation
   */
  private getNestedProperty(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current;
  }
}

// Singleton instance
let configManager: ConfigManager | null = null;

export function getConfigManager(configPath?: string): ConfigManager {
  if (!configManager) {
    configManager = new ConfigManager(configPath);
  }
  return configManager;
}
