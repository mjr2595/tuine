# tuine 🎵

A terminal UI for streaming YouTube audio. Built with Bun, React (Ink), and yt-dlp.

## Features

- 🎧 Stream audio from YouTube URLs
- 📥 Progressive playback (starts playing while downloading)
- 📋 Queue management
- 💾 Smart caching for offline playback
- ⌨️ Keyboard controls
- 🎨 Clean terminal interface

## Requirements

Before running tuine, install these dependencies:

```bash
# Install yt-dlp (required for downloading YouTube audio)
brew install yt-dlp

# Install ffmpeg (required for audio playback and format conversion)
brew install ffmpeg
```

## Installation

```bash
bun install
```

## Usage

Run the application:

```bash
bun start
```

Or run in development mode with hot reload:

```bash
bun dev
```

## How to Use

1. Paste a YouTube URL in the input field and press Enter
2. The audio will start downloading and play automatically
3. Add more URLs to build a queue
4. Use keyboard shortcuts to control playback

### Keyboard Controls

- **Space** - Pause/Play (stops current track)
- **n** - Next track
- **p** - Previous track
- **c** - Clear queue
- **q** - Quit application

## How It Works

1. **URL Input**: Paste a YouTube URL
2. **Download**: yt-dlp downloads the audio to `~/.tuine/cache/`
3. **Progressive Playback**: Audio starts playing after 512KB or 3 seconds
4. **Caching**: Downloaded files are cached for instant replay
5. **Queue**: Automatically advances to next track when finished

## Cache Location

Audio files are cached at: `~/.tuine/cache/`

To clear the cache, delete this directory or use the cache management features (coming soon).

## Legal Notice

⚠️ **Important**: Downloading videos from YouTube may violate YouTube's Terms of Service. This tool is intended for personal, educational use only. Users are responsible for complying with applicable laws and terms of service. Do not redistribute downloaded content.

## Technical Stack

- **Runtime**: Bun v1.0+
- **UI Framework**: Ink (React for terminals)
- **Audio Extraction**: yt-dlp
- **Audio Playback**: ffplay (via FFmpeg) or afplay (macOS)
- **Language**: TypeScript

## Project Structure

```
tuine/
├── src/
│   ├── components/     # React/Ink UI components
│   │   ├── App.tsx           # Main application component
│   │   ├── NowPlaying.tsx    # Current track display
│   │   ├── QueueList.tsx     # Queue visualization
│   │   ├── Controls.tsx      # Keyboard shortcuts help
│   │   └── UrlInput.tsx      # URL input field
│   ├── services/       # Core business logic
│   │   ├── cache.ts          # File caching
│   │   ├── downloader.ts     # yt-dlp wrapper
│   │   ├── player.ts         # Audio playback
│   │   └── queue.ts          # Queue management
│   ├── utils/          # Utilities
│   │   └── system.ts         # System requirements check
│   └── types.ts        # TypeScript type definitions
├── index.ts            # Entry point
└── package.json
```

## Troubleshooting

### "yt-dlp not found"

Install with: `brew install yt-dlp`

### "No audio player found"

Install ffmpeg with: `brew install ffmpeg`

### Audio doesn't play

- Ensure ffmpeg is installed and in your PATH
- Check that the YouTube video is not geo-blocked or age-restricted
- Try a different YouTube URL

### Download fails

- Check your internet connection
- Verify the YouTube URL is valid
- Some videos may be restricted or unavailable

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT

---

Built with [Bun](https://bun.sh) 🥟
