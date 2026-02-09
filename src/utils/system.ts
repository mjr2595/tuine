import { spawn } from "bun";
import { homedir } from "node:os";
import { join } from "node:path";

export function getDataDir(): string {
  // Use XDG_DATA_HOME if set, otherwise use ~/.local/share (Linux/macOS)
  const xdgDataHome = process.env.XDG_DATA_HOME;
  if (xdgDataHome) {
    return join(xdgDataHome, "tuine");
  }
  return join(homedir(), ".local", "share", "tuine");
}

export interface SystemCheck {
  ytdlp: boolean;
  audioPlayer: "ffplay" | "afplay" | null;
  ffmpeg: boolean;
}

export async function checkSystemRequirements(): Promise<SystemCheck> {
  const result: SystemCheck = {
    ytdlp: false,
    audioPlayer: null,
    ffmpeg: false,
  };

  // Check for yt-dlp
  try {
    const proc = spawn(["yt-dlp", "--version"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    await proc.exited;
    result.ytdlp = proc.exitCode === 0;
  } catch (error) {
    result.ytdlp = false;
  }

  // Check for ffplay
  try {
    const proc = spawn(["ffplay", "-version"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    await proc.exited;
    if (proc.exitCode === 0) {
      result.audioPlayer = "ffplay";
    }
  } catch (error) {
    // ffplay not found, try afplay
  }

  // Check for afplay (macOS only)
  if (!result.audioPlayer) {
    try {
      const proc = spawn(["which", "afplay"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      await proc.exited;
      if (proc.exitCode === 0) {
        result.audioPlayer = "afplay";
      }
    } catch (error) {
      // afplay not found
    }
  }

  // Check for ffmpeg
  try {
    const proc = spawn(["ffmpeg", "-version"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    await proc.exited;
    result.ffmpeg = proc.exitCode === 0;
  } catch (error) {
    result.ffmpeg = false;
  }

  return result;
}

export function getInstallationInstructions(check: SystemCheck): string[] {
  const instructions: string[] = [];

  if (!check.ytdlp) {
    instructions.push("❌ yt-dlp not found. Install with: brew install yt-dlp");
  }

  if (!check.audioPlayer) {
    instructions.push(
      "❌ No audio player found. Install ffmpeg with: brew install ffmpeg",
    );
  }

  if (!check.ffmpeg) {
    instructions.push(
      "⚠️  ffmpeg not found. Some features may not work. Install with: brew install ffmpeg",
    );
  }

  return instructions;
}

export function getAudioPlayer(check: SystemCheck): "ffplay" | "afplay" | null {
  return check.audioPlayer;
}
