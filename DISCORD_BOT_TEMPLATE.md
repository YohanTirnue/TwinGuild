# Discord Logging Bot - Feature Template

## Overview
A Discord.js bot that monitors and logs server activity to separate logging channels. It tracks message deletions, edits, and voice channel activity with comprehensive caching and file preservation.

## Core Features

### 1. Message Deletion Logging
**What it does:**
- Monitors when messages are deleted in the main server
- Logs deleted message content, author info, and timestamps to a dedicated log channel
- Preserves and re-uploads attachments from deleted messages
- Extracts and logs URLs contained in deleted messages

**Logged Information:**
- Username and User ID
- Deleted message content
- Message sent timestamp
- Message deleted timestamp
- Channel where message was deleted
- All attachments (preserved and re-uploaded)
- All URLs found in message content

**Log Format:**
```
**MESSAGE DELETED**

Username: [username]
User ID: [user_id]
Deleted message: [message content]

Message sent: [timestamp]
Message deleted: [timestamp]
Channel: #[channel-name]

[Attachments sent as separate messages with files]
[URLs listed separately]
```

### 2. Message Edit Logging
**What it does:**
- Monitors when messages are edited
- Logs both original and edited content
- Provides jump link to the edited message

**Logged Information:**
- Username and User ID
- Before content
- After content
- Edit timestamp
- Channel link
- Direct link to message

**Log Format:**
```
**MESSAGE EDITED**

Username: [username]
User ID: [user_id]
Before: [original content]
After: [edited content]

Edited at: [timestamp]
Channel: #[channel-name]
[Jump to Message](link)
```

### 3. Voice Channel Activity Logging
**What it does:**
- Monitors voice channel joins, leaves, and switches
- Logs all voice activity to a dedicated voice log channel

**Tracked Events:**
- User joins voice channel
- User leaves voice channel
- User switches between voice channels

**Log Format:**
```
**VOICE CHANNEL JOINED/LEFT/SWITCHED**

Username: [username]
User ID: [user_id]
Channel: [channel-name]
From: [old-channel] (for switches)
To: [new-channel] (for switches)
Time: [timestamp]
```

### 4. Message Caching System
**What it does:**
- Maintains an in-memory cache of recent messages (default: 200 messages)
- Caches message content, metadata, and attachment information
- Enables logging of deleted messages even when Discord doesn't provide full data
- Auto-populates cache on bot startup by fetching recent messages from all channels

**Cached Data:**
- Message content
- Author information (ID, username)
- Channel information
- Attachments metadata and file paths
- Extracted URLs
- Message embeds
- Timestamps

**Cache Management:**
- Automatic cleanup when limit exceeded (removes oldest messages)
- Initialization on startup (fetches last 50 messages per channel)

### 5. File Preservation System
**What it does:**
- Downloads and saves all message attachments locally
- Downloads direct file links from URLs
- Organizes files by message ID in folder structure
- Preserves files even after deletion from Discord

**File Handling:**
- Creates directory structure: `./stored_files/[message_id]/[filename]`
- Sanitizes filenames for safe storage
- Supports re-uploading saved files when messages are deleted
- Detects and downloads direct file links from URLs (.jpg, .png, .pdf, etc.)

**Supported File Extensions:**
- Images: .jpg, .jpeg, .png, .gif
- Videos: .mp4
- Audio: .mp3
- Documents: .pdf, .txt, .doc, .docx
- Archives: .zip, .rar

### 6. URL Extraction and Storage
**What it does:**
- Extracts all URLs from message content using regex
- Downloads direct file links
- Stores URL references for deleted message recovery
- Logs URLs separately when messages are deleted

## Configuration

### Required Settings
```javascript
{
    TOKEN: 'bot_token',                    // Discord bot token
    MAIN_SERVER_ID: 'server_id',          // Server to monitor
    LOG_SERVER_ID: 'log_server_id',       // Server with log channels
    MESSAGE_LOG_CHANNEL_ID: 'channel_id', // Message logs channel
    VOICE_LOG_CHANNEL_ID: 'channel_id',   // Voice logs channel
    MESSAGE_CACHE_LIMIT: 200,             // Max cached messages
    STORAGE_DIR: './stored_files'         // File storage location
}
```

### Required Permissions & Intents
**Intents:**
- `Guilds` - Access to guild information
- `GuildMessages` - Read messages
- `GuildVoiceStates` - Monitor voice activity
- `MessageContent` - Access message content (privileged)

**Partials:**
- `Message` - Handle partial message data
- `Channel` - Handle partial channel data
- `User` - Handle partial user data

**Bot Permissions:**
- Read Messages/View Channels
- Send Messages
- Attach Files
- Read Message History
- Connect (for voice state monitoring)

## Architecture

### Event Handlers
1. **ready** - Initializes bot and populates message cache
2. **messageCreate** - Adds new messages to cache
3. **messageDelete** - Logs deletions with cached data
4. **messageUpdate** - Logs edits
5. **voiceStateUpdate** - Logs voice activity

### Helper Functions
- `downloadFile()` - Downloads and saves files from URLs
- `extractUrls()` - Extracts URLs from text using regex
- `cacheMessage()` - Adds message to cache with all metadata

### Data Flow
```
Message Created → Cache Message → Store Attachments
                                ↓
Message Deleted → Retrieve from Cache → Log to Channel → Upload Preserved Files
                                                         ↓
                                                    Log URLs Separately
```

## Dependencies
- `discord.js` - Discord API wrapper
- `axios` - HTTP client for downloading files
- `fs` - File system operations
- `path` - File path handling

## Error Handling
- Client error events logged to console
- Unhandled promise rejections caught and logged
- Individual file download failures don't break caching
- Missing cache data gracefully handled with fallbacks
- Channel fetch errors logged without crashing bot

## Use Cases
- Server moderation and audit logs
- Evidence preservation for rule violations
- Tracking user behavior patterns
- Recovering accidentally deleted content
- Monitoring voice channel usage
- Compliance and record-keeping

## Limitations
- Cache size limited (default 200 messages)
- Only monitors one main server
- Requires message content privileged intent
- File downloads may fail for expired/private URLs
- No database persistence (cache resets on restart, but files are saved)
- No user authentication/privacy controls
