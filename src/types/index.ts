import { Message, VoiceState } from 'discord.js';

// Configuration Types
export interface BotConfig {
  bot: {
    name: string;
    version: string;
    description: string;
    prefix: string;
    status: {
      type: 'playing' | 'streaming' | 'listening' | 'watching';
      text: string;
    };
  };
  cache: {
    messages: {
      limit: number;
      ttl_hours: number;
    };
    users: {
      limit: number;
      ttl_hours: number;
    };
    configs: {
      ttl_minutes: number;
    };
  };
  storage: StorageConfig;
  logging: LoggingConfig;
  performance: PerformanceConfig;
  web: WebConfig;
  features: FeatureConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
}

export interface StorageConfig {
  provider: 'local' | 's3' | 'gcs' | 'azure';
  local: {
    path: string;
    max_size_gb: number;
  };
  files: {
    max_size_mb: number;
    timeout_ms: number;
    concurrent_downloads: number;
    retry_attempts: number;
    retry_delay_ms: number;
  };
  url_file_extensions: string[];
  retention: {
    files_days: number;
    deleted_messages_days: number;
    voice_logs_days: number;
    audit_logs_days: number;
  };
  cleanup: {
    enabled: boolean;
    schedule: string;
    dry_run: boolean;
  };
}

export interface LoggingConfig {
  console: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info' | 'debug';
    colorize: boolean;
  };
  file: {
    enabled: boolean;
    path: string;
    level: 'error' | 'warn' | 'info' | 'debug';
    rotation: 'daily' | 'weekly' | 'size';
    max_files: number;
    max_size_mb: number;
  };
  error_file: {
    enabled: boolean;
    path: string;
  };
  format: {
    timestamp: boolean;
    json: boolean;
  };
}

export interface PerformanceConfig {
  worker_threads: number;
  database: {
    pool_min: number;
    pool_max: number;
    idle_timeout_ms: number;
    connection_timeout_ms: number;
  };
  redis: {
    max_retries: number;
    retry_delay_ms: number;
  };
  rate_limiting: {
    enabled: boolean;
    window_ms: number;
    max_requests: number;
  };
  batch: {
    enabled: boolean;
    size: number;
    interval_ms: number;
  };
}

export interface WebConfig {
  enabled: boolean;
  port: number;
  host: string;
  cors: {
    enabled: boolean;
    origins: string[];
  };
  session: {
    cookie_name: string;
    max_age_ms: number;
    secure: boolean;
  };
  api: {
    prefix: string;
    version: string;
    rate_limit_per_minute: number;
  };
  static: {
    enabled: boolean;
    path: string;
  };
}

export interface FeatureConfig {
  message_logging: MessageLoggingFeatures;
  voice_logging: VoiceLoggingFeatures;
  moderation_logging: ModerationLoggingFeatures;
  member_logging: MemberLoggingFeatures;
  reaction_logging: ReactionLoggingFeatures;
}

export interface MessageLoggingFeatures {
  enabled: boolean;
  log_deletes: boolean;
  log_edits: boolean;
  log_bulk_deletes: boolean;
  preserve_attachments: boolean;
  extract_urls: boolean;
}

export interface VoiceLoggingFeatures {
  enabled: boolean;
  log_joins: boolean;
  log_leaves: boolean;
  log_switches: boolean;
  log_mutes: boolean;
  log_deafens: boolean;
}

export interface ModerationLoggingFeatures {
  enabled: boolean;
  log_bans: boolean;
  log_kicks: boolean;
  log_timeouts: boolean;
  log_role_changes: boolean;
}

export interface MemberLoggingFeatures {
  enabled: boolean;
  log_joins: boolean;
  log_leaves: boolean;
  log_nickname_changes: boolean;
}

export interface ReactionLoggingFeatures {
  enabled: boolean;
  log_adds: boolean;
  log_removes: boolean;
}

export interface MonitoringConfig {
  health_check: {
    enabled: boolean;
    endpoint: string;
    interval_ms: number;
  };
  prometheus: {
    enabled: boolean;
    port: number;
    endpoint: string;
  };
  sentry: {
    enabled: boolean;
    environment: string;
    sample_rate: number;
  };
  alerts: {
    enabled: boolean;
    channels: AlertChannel[];
    thresholds: {
      memory_percent: number;
      cpu_percent: number;
      error_rate_per_minute: number;
    };
  };
}

export interface AlertChannel {
  type: 'discord_webhook' | 'email' | 'slack';
  webhook_url?: string;
  events: string[];
}

export interface SecurityConfig {
  auth: {
    jwt_expires_in: string;
    refresh_token_expires_in: string;
    bcrypt_rounds: number;
  };
  rate_limiting: {
    api: {
      window_ms: number;
      max_requests: number;
    };
    auth: {
      window_ms: number;
      max_requests: number;
    };
  };
  ip_whitelist: {
    enabled: boolean;
    ips: string[];
  };
  file_scanning: {
    enabled: boolean;
    quarantine_path: string;
  };
  encryption: {
    enabled: boolean;
    algorithm: string;
  };
}

// Server Configuration Types
export interface ServerConfig {
  id: string;
  name: string;
  enabled: boolean;
  logging: ServerLoggingConfig;
  features: FeatureConfig;
  filters: ServerFilters;
  settings: ServerSettings;
}

export interface ServerLoggingConfig {
  log_server_id: string;
  channels: {
    message_log: string;
    voice_log: string;
    admin_log?: string;
    moderation_log?: string;
  };
}

export interface ServerFilters {
  ignore_bots: boolean;
  ignore_channels: string[];
  ignore_users: string[];
  ignore_roles: string[];
  monitor_only_channels: string[];
  monitor_only_users: string[];
}

export interface ServerSettings {
  message_cache_limit: number;
  max_file_size_mb: number;
  timezone: string;
  log_format: {
    include_server_name: boolean;
    include_timestamps: boolean;
    include_user_avatar: boolean;
  };
}

// Message Cache Types
export interface CachedMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
  };
  channelId: string;
  channelName: string;
  guildId: string | null;
  attachments: CachedAttachment[];
  urls: CachedURL[];
  embeds: any[];
  timestamp: number;
}

export interface CachedAttachment {
  id: string;
  url: string;
  name: string;
  contentType: string;
  size: number;
  savedPath: string | null;
}

export interface CachedURL {
  url: string;
  savedPath: string | null;
}

// Database Models
export interface DbMessage {
  id: string;
  server_id: string;
  channel_id: string;
  author_id: string;
  author_username: string;
  content: string | null;
  created_at: Date;
  deleted_at: Date | null;
  edited_at: Date | null;
  is_deleted: boolean;
}

export interface DbAttachment {
  id: string;
  message_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  original_url: string;
  storage_path: string | null;
  storage_type: 'local' | 's3' | 'gcs' | 'azure';
  downloaded: boolean;
  created_at: Date;
}

export interface DbVoiceLog {
  id: number;
  server_id: string;
  user_id: string;
  username: string;
  action: 'join' | 'leave' | 'switch' | 'mute' | 'unmute' | 'deafen' | 'undeafen';
  channel_id: string | null;
  channel_name: string | null;
  from_channel_id: string | null;
  from_channel_name: string | null;
  timestamp: Date;
}

export interface DbBotSetting {
  key: string;
  value: any;
  updated_at: Date;
  updated_by: string | null;
}

export interface DbAuditLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: any;
  performed_by: string;
  ip_address: string | null;
  timestamp: Date;
}

// Storage Provider Interface
export interface StorageProvider {
  uploadFile(filePath: string, key: string): Promise<string>;
  downloadFile(key: string, destination: string): Promise<void>;
  deleteFile(key: string): Promise<void>;
  fileExists(key: string): Promise<boolean>;
  getFileUrl(key: string): Promise<string>;
}

// Event Handler Types
export type EventHandler<T = any> = (data: T) => Promise<void> | void;

export interface BotEvents {
  ready: () => void;
  messageCreate: (message: Message) => void;
  messageDelete: (message: Message) => void;
  messageUpdate: (oldMessage: Message, newMessage: Message) => void;
  voiceStateUpdate: (oldState: VoiceState, newState: VoiceState) => void;
  error: (error: Error) => void;
}

// API Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthToken {
  token: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserPayload {
  id: string;
  username: string;
  role: 'admin' | 'moderator' | 'viewer';
}

export interface DashboardStats {
  serversMonitored: number;
  messagesLoggedToday: number;
  messagesDeleted: number;
  messagesEdited: number;
  voiceEvents: number;
  filesStoredTotal: number;
  storageUsedGB: number;
  botUptime: number;
  botStatus: 'online' | 'offline' | 'degraded';
}

// Utility Types
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: any;
}
