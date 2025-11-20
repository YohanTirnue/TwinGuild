# TwinGuild Discord Bot v2.0

Advanced Discord logging and monitoring bot with file preservation, built with TypeScript and discord.js.

## Features

- **Message Deletion Logging** - Captures and logs deleted messages with full content, attachments, and URLs
- **Message Edit Logging** - Tracks message edits with before/after comparison
- **Voice Channel Activity Logging** - Monitors joins, leaves, and switches between voice channels
- **Message Caching System** - Keeps recent messages in memory for recovery
- **File Preservation** - Downloads and saves all attachments locally for recovery
- **URL Extraction** - Finds and downloads direct file links from message content
- **Multi-Server Support** - Monitor multiple servers with independent configurations
- **Configurable Filtering** - Per-server channel, user, and role filters

## Architecture

This bot is built with a modular TypeScript architecture:

```
src/
├── core/          # Core bot functionality
├── modules/       # Feature modules (MessageLogger, VoiceLogger, FileManager)
├── utils/         # Utilities (Logger, etc.)
└── types/         # TypeScript type definitions
```

## Requirements

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Discord Bot Token with these intents:
  - Guilds
  - Guild Messages
  - Guild Voice States
  - Message Content (Privileged Intent)
  - Guild Members

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd TwinGuild
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Discord bot token:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
```

### 3. Configure Servers

Edit `config/servers.yml` and add your server IDs:

```yaml
servers:
  - id: "YOUR_MAIN_SERVER_ID"
    name: "Main Server"
    enabled: true
    logging:
      log_server_id: "YOUR_LOG_SERVER_ID"
      channels:
        message_log: "MESSAGE_LOG_CHANNEL_ID"
        voice_log: "VOICE_LOG_CHANNEL_ID"
    # ... other settings
```

### 4. Run the Bot

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## Configuration

The bot uses a multi-layer configuration system:

### 1. Environment Variables (.env)
- Sensitive credentials (bot token, API keys)
- Deployment-specific settings

### 2. Configuration Files (config/*.yml)
- `default.yml` - Global bot configuration
- `servers.yml` - Per-server settings and feature flags

### 3. Per-Server Settings
Each server can have its own:
- Feature toggles (enable/disable specific logging)
- Log channels
- Filters (ignore channels, users, roles)
- Custom settings

## Docker Deployment

### Using Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f bot

# Stop
docker-compose down
```

### Using Docker Directly

```bash
# Build image
docker build -t twinguild-bot .

# Run container
docker run -d \
  --name twinguild-bot \
  --env-file .env \
  -v $(pwd)/config:/app/config:ro \
  -v $(pwd)/stored_files:/app/stored_files \
  -v $(pwd)/logs:/app/logs \
  twinguild-bot
```

## Development

### Project Structure

```
TwinGuild/
├── src/
│   ├── core/
│   │   ├── BotClient.ts         # Main Discord client wrapper
│   │   └── ConfigManager.ts     # Configuration management
│   ├── modules/
│   │   ├── MessageLogger/       # Message logging module
│   │   ├── VoiceLogger/         # Voice activity logging
│   │   └── FileManager/         # File download and storage
│   ├── utils/
│   │   └── Logger.ts            # Winston logger
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── index.ts                 # Application entry point
├── config/
│   ├── default.yml              # Default configuration
│   └── servers.yml              # Server configurations
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

### Scripts

```bash
npm run dev          # Development mode with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run typecheck    # Type check without emitting
```

### Building Standalone Executables

```bash
# Build optimized bundle
npm run build:bundle

# Create executables for all platforms
npm run build:exe

# Output in dist/bin/:
# - discord-bot-linux
# - discord-bot-win.exe
# - discord-bot-macos
```

## Configuration Options

### Feature Flags

Control what gets logged:

```yaml
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
```

### Filters

Control what gets ignored:

```yaml
filters:
  ignore_bots: true
  ignore_channels:
    - "channel_id_1"
    - "channel_id_2"
  ignore_users:
    - "user_id_1"
  ignore_roles:
    - "role_id_1"
```

### Storage Settings

Configure file storage:

```yaml
storage:
  provider: "local"  # or "s3", "gcs", "azure"
  local:
    path: "./stored_files"
    max_size_gb: 50
  files:
    max_size_mb: 25
    timeout_ms: 30000
    concurrent_downloads: 10
```

## Logging

Logs are written to:
- Console (with colors in development)
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

Configure logging in `config/default.yml`:

```yaml
logging:
  console:
    enabled: true
    level: "info"  # error, warn, info, debug
  file:
    enabled: true
    level: "info"
    rotation: "daily"
    max_files: 30
```

## Troubleshooting

### Bot doesn't start

1. Check your bot token is correct in `.env`
2. Verify all required intents are enabled in Discord Developer Portal
3. Check logs in `logs/error.log`

### Messages aren't being logged

1. Verify server is enabled in `config/servers.yml`
2. Check log channel IDs are correct
3. Ensure bot has permissions to read messages and send to log channels
4. Check feature flags are enabled

### Attachments aren't being saved

1. Verify `preserve_attachments: true` in server config
2. Check `stored_files/` directory permissions
3. Verify file size is under `max_size_mb` limit
4. Check logs for download errors

## Performance

The bot is optimized for performance:
- LRU cache for messages (configurable size)
- Concurrent file downloads (configurable limit)
- Retry logic with exponential backoff
- Graceful error handling

### Resource Usage

Typical resource usage:
- **Memory**: 100-300 MB (depends on cache size and file downloads)
- **CPU**: < 5% (idle), up to 50% (during heavy file downloads)
- **Disk**: Depends on attachment volume

## Security

- Never commit `.env` file
- Rotate bot token regularly
- Use least privilege for bot permissions
- Monitor file storage for suspicious uploads
- Keep dependencies updated

## Roadmap

- [ ] Web admin panel for configuration
- [ ] PostgreSQL database for long-term storage
- [ ] Redis caching for improved performance
- [ ] S3/GCS/Azure storage support
- [ ] Moderation logging (bans, kicks, timeouts)
- [ ] Member logging (joins, leaves, nickname changes)
- [ ] Reaction logging
- [ ] Analytics dashboard
- [ ] Export/backup functionality
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Credits

Built with:
- [discord.js](https://discord.js.org/) - Discord API wrapper
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Winston](https://github.com/winstonjs/winston) - Logging
- [Axios](https://axios-http.com/) - HTTP client
- [yaml](https://github.com/eemeli/yaml) - YAML parser

---

Made with ❤️ for TwinGuild
