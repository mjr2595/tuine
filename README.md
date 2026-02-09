# tuine

A terminal UI for streaming YouTube audio. Built with Bun, React (Ink), and yt-dlp.

## Features

- Stream audio from YouTube URLs
- Progressive playback (starts playing while downloading)
- Queue management
- Smart caching for offline playback

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

Check system requirements:

```bash
bun start --check
```

This will verify all dependencies and show their status without starting the player.

## How to Use

1. Paste a YouTube URL in the input field and press Enter
2. The audio will start downloading and play automatically
3. Add more URLs to build a queue
4. Use keyboard shortcuts to control playback
5. Optionally save and load playlists

## How It Works

1. **URL Input**: Paste a YouTube URL
2. **Download**: yt-dlp downloads the audio to `~/.tuine/cache/`
3. **Progressive Playback**: Audio starts playing after 512KB or 3 seconds
4. **Caching**: Downloaded files are cached for instant replay
5. **Queue**: Automatically advances to next track when finished

## Cache Location

Audio files are cached at: `~/.tuine/cache/`

To clear the cache, delete this directory or use the cache management features (coming soon).

## Technical Stack

- **Runtime**: Bun v1.0+
- **UI Framework**: Ink (React for terminals)
- **Audio Extraction**: yt-dlp
- **Audio Playback**: ffplay (via FFmpeg) or afplay (macOS)
- **Language**: TypeScript

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

#### PRs are welcome

> [!IMPORTANT]  
> Downloading videos from YouTube may violate YouTube's Terms of Service. This tool is intended for personal, educational use only. Users are responsible for complying with applicable laws and terms of service. Do not redistribute downloaded content.
