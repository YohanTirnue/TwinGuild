# Configuration Examples

## 1. Environment Variables (.env)

```env
# ===========================================
# DISCORD BOT CONFIGURATION
# ===========================================

# Bot Token (REQUIRED)
# Get this from https://discord.com/developers/applications
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# ===========================================
# DATABASE CONFIGURATION
# ===========================================

# PostgreSQL Connection
DATABASE_URL=postgresql://discord_bot:secure_password@localhost:5432/discord_bot
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis Connection (for caching)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=optional_redis_password

# ===========================================
# WEB ADMIN PANEL
# ===========================================

# Web server port
WEB_PORT=3000

# Admin credentials (initial setup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_me_please

# Session secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your_very_secure_random_string_here

# JWT secret for API authentication
JWT_SECRET=another_secure_random_string

# Token expiration
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# ===========================================
# STORAGE CONFIGURATION
# ===========================================

# Storage provider: 'local', 's3', 'gcs', 'azure'
STORAGE_PROVIDER=local

# Local storage path
LOCAL_STORAGE_PATH=./stored_files

# S3 Configuration (if using S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET=discord-attachments
S3_ENDPOINT=  # Leave empty for AWS, or use custom endpoint for MinIO

# Google Cloud Storage (if using GCS)
GCS_PROJECT_ID=your-project-id
GCS_BUCKET=discord-attachments
GCS_KEYFILE_PATH=./gcs-keyfile.json

# Azure Blob Storage (if using Azure)
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_CONTAINER_NAME=discord-attachments

# ===========================================
# PERFORMANCE & LIMITS
# ===========================================

# Message cache settings
MESSAGE_CACHE_LIMIT=200
MESSAGE_CACHE_TTL_HOURS=24

# File download settings
MAX_CONCURRENT_DOWNLOADS=10
MAX_FILE_SIZE_MB=25
DOWNLOAD_TIMEOUT_MS=30000

# Worker threads (for parallel processing)
WORKER_THREADS=4

# ===========================================
# LOGGING
# ===========================================

# Log level: 'error', 'warn', 'info', 'debug'
LOG_LEVEL=info

# Enable file logging
LOG_TO_FILE=true
LOG_FILE_PATH=./logs
LOG_ROTATION=daily
LOG_MAX_FILES=30

# ===========================================
# FEATURES & TOGGLES
# ===========================================

# Global feature toggles
ENABLE_MESSAGE_LOGGING=true
ENABLE_VOICE_LOGGING=true
ENABLE_FILE_PRESERVATION=true
ENABLE_WEB_PANEL=true
ENABLE_METRICS=true

# ===========================================
# MONITORING & ALERTS
# ===========================================

# Sentry (error tracking)
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id

# Discord webhook for alerts
ALERT_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Prometheus metrics
ENABLE_PROMETHEUS=true
PROMETHEUS_PORT=9090

# ===========================================
# ENVIRONMENT
# ===========================================

NODE_ENV=production
TZ=UTC

# ===========================================
# SECURITY
# ===========================================

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# CORS allowed origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Enable HTTPS
ENABLE_HTTPS=false
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem

# API rate limiting
API_RATE_LIMIT_PER_MINUTE=60

# ===========================================
# DATA RETENTION
# ===========================================

# How long to keep deleted messages (days)
RETENTION_DELETED_MESSAGES_DAYS=90

# How long to keep files (days)
RETENTION_FILES_DAYS=90

# How long to keep voice logs (days)
RETENTION_VOICE_LOGS_DAYS=30

# Auto-cleanup schedule (cron format)
CLEANUP_SCHEDULE="0 2 * * *"  # 2 AM daily
```

---

## 2. Main Configuration File (config/default.yml)

```yaml
# ===========================================
# BOT INFORMATION
# ===========================================
bot:
  name: "TwinGuild Logger"
  version: "2.0.0"
  description: "Advanced Discord logging and monitoring bot"
  prefix: "!"
  status:
    type: "watching"  # playing, streaming, listening, watching
    text: "server activity"

# ===========================================
# CACHE CONFIGURATION
# ===========================================
cache:
  # In-memory message cache
  messages:
    limit: 200
    ttl_hours: 24

  # User cache
  users:
    limit: 1000
    ttl_hours: 1

  # Server config cache
  configs:
    ttl_minutes: 5

# ===========================================
# STORAGE CONFIGURATION
# ===========================================
storage:
  # Provider: local, s3, gcs, azure
  provider: "local"

  # Local storage settings
  local:
    path: "./stored_files"
    max_size_gb: 50

  # File handling
  files:
    max_size_mb: 25
    timeout_ms: 30000
    concurrent_downloads: 10
    retry_attempts: 3
    retry_delay_ms: 1000

  # Supported extensions for URL downloads
  url_file_extensions:
    - .jpg
    - .jpeg
    - .png
    - .gif
    - .webp
    - .mp4
    - .mp3
    - .wav
    - .pdf
    - .zip
    - .rar
    - .7z
    - .txt
    - .doc
    - .docx
    - .xls
    - .xlsx

  # Retention policy
  retention:
    files_days: 90
    deleted_messages_days: 90
    voice_logs_days: 30
    audit_logs_days: 365

  # Auto-cleanup
  cleanup:
    enabled: true
    schedule: "0 2 * * *"  # Daily at 2 AM
    dry_run: false

# ===========================================
# LOGGING CONFIGURATION
# ===========================================
logging:
  # Console output
  console:
    enabled: true
    level: "info"
    colorize: true

  # File output
  file:
    enabled: true
    path: "./logs"
    level: "info"
    rotation: "daily"  # daily, weekly, size
    max_files: 30
    max_size_mb: 10

  # Separate error log
  error_file:
    enabled: true
    path: "./logs/error.log"

  # Log format
  format:
    timestamp: true
    json: false  # Use JSON format for production

# ===========================================
# PERFORMANCE CONFIGURATION
# ===========================================
performance:
  # Worker threads
  worker_threads: 4

  # Database connection pooling
  database:
    pool_min: 2
    pool_max: 10
    idle_timeout_ms: 30000
    connection_timeout_ms: 2000

  # Redis connection
  redis:
    max_retries: 3
    retry_delay_ms: 1000

  # Rate limiting
  rate_limiting:
    enabled: true
    window_ms: 60000
    max_requests: 100

  # Batch processing
  batch:
    enabled: true
    size: 100
    interval_ms: 5000

# ===========================================
# WEB ADMIN PANEL
# ===========================================
web:
  enabled: true
  port: 3000
  host: "0.0.0.0"

  # CORS settings
  cors:
    enabled: true
    origins:
      - "http://localhost:3000"
      - "https://yourdomain.com"

  # Session settings
  session:
    cookie_name: "discord_bot_session"
    max_age_ms: 86400000  # 24 hours
    secure: false  # Set to true in production with HTTPS

  # API settings
  api:
    prefix: "/api"
    version: "v1"
    rate_limit_per_minute: 60

  # Static files
  static:
    enabled: true
    path: "./web-ui/build"

# ===========================================
# FEATURES
# ===========================================
features:
  # Global feature flags (can be overridden per server)
  message_logging:
    enabled: true
    log_deletes: true
    log_edits: true
    log_bulk_deletes: true
    preserve_attachments: true
    extract_urls: true

  voice_logging:
    enabled: true
    log_joins: true
    log_leaves: true
    log_switches: true
    log_mutes: true
    log_deafens: true

  moderation_logging:
    enabled: false  # Future feature
    log_bans: true
    log_kicks: true
    log_timeouts: true
    log_role_changes: true

  member_logging:
    enabled: false  # Future feature
    log_joins: true
    log_leaves: true
    log_nickname_changes: true

  reaction_logging:
    enabled: false  # Future feature
    log_adds: true
    log_removes: true

# ===========================================
# MONITORING & METRICS
# ===========================================
monitoring:
  # Health check endpoint
  health_check:
    enabled: true
    endpoint: "/health"
    interval_ms: 30000

  # Prometheus metrics
  prometheus:
    enabled: true
    port: 9090
    endpoint: "/metrics"

  # Sentry error tracking
  sentry:
    enabled: false
    environment: "production"
    sample_rate: 1.0

  # Custom alerts
  alerts:
    enabled: true
    channels:
      - type: "discord_webhook"
        webhook_url: "${ALERT_WEBHOOK_URL}"
        events:
          - "bot_disconnect"
          - "database_error"
          - "storage_full"
          - "high_memory_usage"
    thresholds:
      memory_percent: 90
      cpu_percent: 90
      error_rate_per_minute: 10

# ===========================================
# SECURITY
# ===========================================
security:
  # Authentication
  auth:
    jwt_expires_in: "7d"
    refresh_token_expires_in: "30d"
    bcrypt_rounds: 10

  # Rate limiting
  rate_limiting:
    api:
      window_ms: 60000
      max_requests: 60
    auth:
      window_ms: 900000  # 15 minutes
      max_requests: 5

  # IP restrictions
  ip_whitelist:
    enabled: false
    ips: []

  # File security
  file_scanning:
    enabled: false  # Requires ClamAV
    quarantine_path: "./quarantine"

  # Data encryption
  encryption:
    enabled: false
    algorithm: "aes-256-gcm"

# ===========================================
# INTEGRATIONS
# ===========================================
integrations:
  # Webhook notifications
  webhooks:
    enabled: false
    endpoints: []

  # External APIs
  apis:
    enabled: false
    endpoints: []

# ===========================================
# EXPERIMENTAL FEATURES
# ===========================================
experimental:
  # AI-powered content moderation
  ai_moderation:
    enabled: false

  # Automatic backup
  auto_backup:
    enabled: false
    interval_hours: 24

  # Multi-language support
  i18n:
    enabled: false
    default_locale: "en"
```

---

## 3. Server Configuration File (config/servers.yml)

```yaml
servers:
  # ===========================================
  # MAIN SERVER 1
  # ===========================================
  - id: "1387082567991431208"
    name: "Main Server"
    enabled: true

    # Logging configuration
    logging:
      # Server where logs are sent
      log_server_id: "1334503589481152545"

      # Log channels
      channels:
        message_log: "1394373569063944344"
        voice_log: "1394373619773079552"
        admin_log: "1394373700000000000"  # Optional
        moderation_log: "1394373800000000000"  # Optional

    # Feature overrides (override global settings)
    features:
      message_logging:
        enabled: true
        log_deletes: true
        log_edits: true
        preserve_attachments: true
        extract_urls: true

      voice_logging:
        enabled: true
        log_joins: true
        log_leaves: true
        log_switches: true

      moderation_logging:
        enabled: false

    # Filters
    filters:
      # Ignore messages from bots
      ignore_bots: true

      # Ignore specific channels
      ignore_channels:
        - "1387082567991431209"  # Off-topic
        - "1387082567991431210"  # Spam

      # Ignore specific users
      ignore_users:
        - "123456789012345678"

      # Ignore specific roles
      ignore_roles:
        - "987654321098765432"  # Moderator role

      # Monitor only specific channels (if set, only these are monitored)
      monitor_only_channels: []

      # Monitor only specific users (if set, only these are monitored)
      monitor_only_users: []

    # Custom settings
    settings:
      # Message cache limit for this server
      message_cache_limit: 500

      # File size limit (MB)
      max_file_size_mb: 25

      # Timezone for timestamps
      timezone: "America/New_York"

      # Custom log format
      log_format:
        include_server_name: true
        include_timestamps: true
        include_user_avatar: true

  # ===========================================
  # MAIN SERVER 2
  # ===========================================
  - id: "9876543210987654321"
    name: "Secondary Server"
    enabled: true

    logging:
      log_server_id: "1334503589481152545"  # Same log server
      channels:
        message_log: "1394373569063944345"  # Different channel
        voice_log: "1394373619773079553"

    features:
      message_logging:
        enabled: true
        log_deletes: true
        log_edits: false  # Don't log edits for this server
        preserve_attachments: false  # Don't preserve attachments

      voice_logging:
        enabled: false  # Disable voice logging

    filters:
      ignore_bots: true
      ignore_channels: []
      ignore_users: []

    settings:
      message_cache_limit: 100  # Smaller cache
      max_file_size_mb: 10
      timezone: "UTC"

  # ===========================================
  # LOG SERVER (Monitor itself)
  # ===========================================
  - id: "1334503589481152545"
    name: "Log Server"
    enabled: true

    logging:
      log_server_id: "1334503589481152545"  # Logs to itself
      channels:
        message_log: "1394374000000000000"
        admin_log: "1394374100000000000"

    features:
      message_logging:
        enabled: true
        log_deletes: true
        log_edits: true
        preserve_attachments: true

      voice_logging:
        enabled: false

    filters:
      ignore_bots: true
      # Don't log the bot's own messages in log channels
      ignore_channels:
        - "1394373569063944344"
        - "1394373619773079552"
```

---

## 4. Web Admin Panel - Configuration UI Example

### Dashboard View (React Component Pseudo-code)

```typescript
interface DashboardProps {
  stats: {
    serversMonitored: number;
    messagesLoggedToday: number;
    filesStoredTotal: number;
    storageUsedGB: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="dashboard">
      <h1>Discord Bot Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Servers Monitored"
          value={stats.serversMonitored}
          icon="📊"
        />
        <StatCard
          title="Messages Today"
          value={stats.messagesLoggedToday}
          icon="💬"
        />
        <StatCard
          title="Files Stored"
          value={stats.filesStoredTotal}
          icon="📁"
        />
        <StatCard
          title="Storage Used"
          value={`${stats.storageUsedGB} GB`}
          icon="💾"
        />
      </div>

      {/* Charts */}
      <div className="charts">
        <MessageActivityChart />
        <VoiceActivityChart />
      </div>

      {/* Recent Activity */}
      <RecentActivityFeed />
    </div>
  );
};
```

### Server Configuration Form

```typescript
interface ServerConfigForm {
  serverId: string;
  name: string;
  enabled: boolean;
  logServerId: string;
  channels: {
    messageLog: string;
    voiceLog: string;
    adminLog?: string;
  };
  features: {
    messageLogging: {
      enabled: boolean;
      logDeletes: boolean;
      logEdits: boolean;
      preserveAttachments: boolean;
    };
    voiceLogging: {
      enabled: boolean;
      logJoins: boolean;
      logLeaves: boolean;
    };
  };
  filters: {
    ignoreBots: boolean;
    ignoreChannels: string[];
    ignoreUsers: string[];
  };
}

const ServerConfigEditor: React.FC = () => {
  const [config, setConfig] = useState<ServerConfigForm>({...});

  const handleSave = async () => {
    await api.updateServerConfig(config.serverId, config);
    toast.success('Configuration saved!');
  };

  return (
    <form className="server-config-form">
      <h2>Server Configuration</h2>

      {/* Basic Info */}
      <section>
        <h3>Basic Information</h3>
        <Input
          label="Server ID"
          value={config.serverId}
          disabled
        />
        <Input
          label="Server Name"
          value={config.name}
          onChange={(e) => setConfig({...config, name: e.target.value})}
        />
        <Toggle
          label="Enable Monitoring"
          checked={config.enabled}
          onChange={(checked) => setConfig({...config, enabled: checked})}
        />
      </section>

      {/* Log Channels */}
      <section>
        <h3>Log Channels</h3>
        <ChannelSelect
          label="Message Log Channel"
          serverId={config.logServerId}
          value={config.channels.messageLog}
          onChange={(channelId) =>
            setConfig({
              ...config,
              channels: {...config.channels, messageLog: channelId}
            })
          }
        />
        <ChannelSelect
          label="Voice Log Channel"
          serverId={config.logServerId}
          value={config.channels.voiceLog}
          onChange={(channelId) =>
            setConfig({
              ...config,
              channels: {...config.channels, voiceLog: channelId}
            })
          }
        />
      </section>

      {/* Features */}
      <section>
        <h3>Features</h3>

        <FeatureGroup title="Message Logging">
          <Toggle
            label="Enable Message Logging"
            checked={config.features.messageLogging.enabled}
            onChange={(checked) =>
              setConfig({
                ...config,
                features: {
                  ...config.features,
                  messageLogging: {
                    ...config.features.messageLogging,
                    enabled: checked
                  }
                }
              })
            }
          />

          {config.features.messageLogging.enabled && (
            <>
              <Toggle label="Log Deletes" checked={...} />
              <Toggle label="Log Edits" checked={...} />
              <Toggle label="Preserve Attachments" checked={...} />
            </>
          )}
        </FeatureGroup>

        <FeatureGroup title="Voice Logging">
          <Toggle label="Enable Voice Logging" checked={...} />
          {/* More toggles */}
        </FeatureGroup>
      </section>

      {/* Filters */}
      <section>
        <h3>Filters</h3>
        <Toggle label="Ignore Bots" checked={config.filters.ignoreBots} />

        <MultiSelect
          label="Ignore Channels"
          options={channelOptions}
          value={config.filters.ignoreChannels}
          onChange={(channels) =>
            setConfig({
              ...config,
              filters: {...config.filters, ignoreChannels: channels}
            })
          }
        />

        <UserList
          label="Ignore Users"
          users={config.filters.ignoreUsers}
          onAdd={(userId) => {...}}
          onRemove={(userId) => {...}}
        />
      </section>

      {/* Actions */}
      <div className="form-actions">
        <Button onClick={handleSave} variant="primary">
          Save Configuration
        </Button>
        <Button onClick={handleTest} variant="secondary">
          Test Logging
        </Button>
      </div>
    </form>
  );
};
```

---

## 5. API Configuration Endpoint Examples

### GET /api/config

```json
{
  "status": "success",
  "data": {
    "bot": {
      "name": "TwinGuild Logger",
      "version": "2.0.0",
      "uptime": 86400,
      "status": "online"
    },
    "cache": {
      "messages": {
        "limit": 200,
        "current": 156,
        "hit_rate": 0.87
      }
    },
    "storage": {
      "provider": "s3",
      "usage_gb": 12.4,
      "limit_gb": 50,
      "files_count": 1247
    },
    "features": {
      "message_logging": {
        "enabled": true,
        "log_deletes": true,
        "log_edits": true
      },
      "voice_logging": {
        "enabled": true
      }
    }
  }
}
```

### PUT /api/config/servers/:serverId

```json
{
  "enabled": true,
  "logging": {
    "log_server_id": "1334503589481152545",
    "channels": {
      "message_log": "1394373569063944344",
      "voice_log": "1394373619773079552"
    }
  },
  "features": {
    "message_logging": {
      "enabled": true,
      "log_deletes": true,
      "log_edits": true,
      "preserve_attachments": true
    }
  },
  "filters": {
    "ignore_bots": true,
    "ignore_channels": ["123456789"],
    "ignore_users": []
  }
}
```

### Response:

```json
{
  "status": "success",
  "message": "Server configuration updated",
  "data": {
    "server_id": "1387082567991431208",
    "updated_at": "2024-01-15T10:30:00Z",
    "changes": [
      "features.message_logging.log_edits: false -> true",
      "filters.ignore_channels: added 123456789"
    ]
  }
}
```

---

## 6. Docker Compose Configuration

```yaml
version: '3.8'

services:
  bot:
    build: .
    container_name: discord-bot
    restart: unless-stopped
    env_file: .env
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://discord_bot:${DB_PASSWORD}@postgres:5432/discord_bot
      REDIS_URL: redis://redis:6379
    volumes:
      - ./config:/app/config:ro
      - ./stored_files:/app/stored_files
      - ./logs:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - bot-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build: ./web-ui
    container_name: discord-bot-web
    restart: unless-stopped
    ports:
      - "${WEB_PORT:-3000}:3000"
    env_file: .env
    depends_on:
      - bot
    networks:
      - bot-network

  postgres:
    image: postgres:15-alpine
    container_name: discord-bot-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: discord_bot
      POSTGRES_USER: discord_bot
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - bot-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U discord_bot"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: discord-bot-redis
    restart: unless-stopped
    command: redis-server --appendonly yes ${REDIS_PASSWORD:+--requirepass $REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - bot-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Optional: Prometheus for metrics
  prometheus:
    image: prom/prometheus:latest
    container_name: discord-bot-prometheus
    restart: unless-stopped
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - bot-network
    profiles:
      - monitoring

  # Optional: Grafana for visualization
  grafana:
    image: grafana/grafana:latest
    container_name: discord-bot-grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana-dashboards:/etc/grafana/provisioning/dashboards:ro
    ports:
      - "3001:3000"
    networks:
      - bot-network
    profiles:
      - monitoring

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  bot-network:
    driver: bridge
```

---

## 7. CLI Configuration Tool

```bash
#!/bin/bash
# config-tool.sh - Interactive configuration generator

echo "==================================="
echo "Discord Bot Configuration Wizard"
echo "==================================="
echo

# Bot Token
read -p "Enter your Discord bot token: " BOT_TOKEN

# Database
read -p "Database host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}
read -p "Database password: " -s DB_PASSWORD
echo

# Redis
read -p "Use Redis for caching? (y/n) [y]: " USE_REDIS
USE_REDIS=${USE_REDIS:-y}

# Storage
echo
echo "Storage Provider:"
echo "1) Local"
echo "2) AWS S3"
echo "3) Google Cloud Storage"
read -p "Select (1-3) [1]: " STORAGE_CHOICE
STORAGE_CHOICE=${STORAGE_CHOICE:-1}

# Generate .env file
cat > .env <<EOF
DISCORD_BOT_TOKEN=${BOT_TOKEN}
DATABASE_URL=postgresql://discord_bot:${DB_PASSWORD}@${DB_HOST}:5432/discord_bot
$(if [ "$USE_REDIS" = "y" ]; then echo "REDIS_URL=redis://localhost:6379"; fi)

$(if [ "$STORAGE_CHOICE" = "1" ]; then echo "STORAGE_PROVIDER=local"; fi)
$(if [ "$STORAGE_CHOICE" = "2" ]; then echo "STORAGE_PROVIDER=s3"; fi)
$(if [ "$STORAGE_CHOICE" = "3" ]; then echo "STORAGE_PROVIDER=gcs"; fi)

NODE_ENV=production
LOG_LEVEL=info
WEB_PORT=3000
EOF

echo
echo "✅ Configuration saved to .env"
echo "⚠️  Remember to add your server IDs to config/servers.yml"
```

This provides comprehensive configuration examples for every layer of the system!
