import { spawn } from "bun";
import { existsSync, statSync } from "fs";
import type { PlaybackState } from "../types";

export type PlayerType = "ffplay" | "afplay";

export interface PlayerOptions {
  playerType: PlayerType;
}

export class Player {
  private currentProcess: any = null;
  private state: PlaybackState = "idle";
  private currentFile: string | null = null;
  private playerType: PlayerType;
  private onFinishCallback: (() => void) | null = null;
  private startTime: number = 0;
  private progressInterval: NodeJS.Timeout | null = null;
  private onProgressCallback: ((seconds: number) => void) | null = null;

  constructor(options: PlayerOptions) {
    this.playerType = options.playerType;
  }

  async play(
    filePath: string,
    onFinish?: () => void,
    onProgress?: (seconds: number) => void,
  ): Promise<void> {
    // Stop any current playback
    this.stop();

    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    this.currentFile = filePath;
    this.onFinishCallback = onFinish || null;
    this.onProgressCallback = onProgress || null;
    this.state = "buffering";

    // Wait for file to have some content (progressive playback)
    await this.waitForPlayableContent(filePath);

    this.state = "playing";
    this.startTime = Date.now();

    // Start progress tracking
    this.progressInterval = setInterval(() => {
      if (this.state === "playing" && this.onProgressCallback) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.onProgressCallback(elapsed);
      }
    }, 1000);

    try {
      if (this.playerType === "ffplay") {
        this.currentProcess = spawn(
          ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet", filePath],
          {
            stdout: "pipe",
            stderr: "pipe",
          },
        );
      } else {
        // afplay
        this.currentProcess = spawn(["afplay", filePath], {
          stdout: "pipe",
          stderr: "pipe",
        });
      }

      // Monitor process completion
      this.currentProcess.exited.then(() => {
        if (this.state === "playing") {
          this.state = "finished";
          this.clearProgressInterval();
          if (this.onFinishCallback) {
            this.onFinishCallback();
          }
        }
      });
    } catch (error) {
      this.state = "idle";
      this.clearProgressInterval();
      throw error;
    }
  }

  stop(): void {
    if (this.currentProcess) {
      try {
        this.currentProcess.kill();
      } catch (error) {
        // Process may already be terminated
      }
      this.currentProcess = null;
    }
    this.clearProgressInterval();
    this.state = "idle";
    this.currentFile = null;
  }

  private clearProgressInterval(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  pause(): void {
    // Since we can't actually pause the process, we'll stop and track position
    // This is a limitation of using external players
    // For MVP, pause means stop
    this.stop();
    this.state = "paused";
  }

  resume(): void {
    // Resume is not supported with external players
    // User will need to restart the track
    if (this.currentFile && this.state === "paused") {
      this.play(this.currentFile);
    }
  }

  getState(): PlaybackState {
    return this.state;
  }

  isPlaying(): boolean {
    return this.state === "playing";
  }

  getCurrentFile(): string | null {
    return this.currentFile;
  }

  private async waitForPlayableContent(
    filePath: string,
    minSize = 512 * 1024,
  ): Promise<void> {
    // Wait until file has at least minSize bytes (512KB) or 5 seconds max
    const maxWait = 5000; // 5 seconds
    const checkInterval = 200; // Check every 200ms
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      try {
        const stats = statSync(filePath);
        if (stats.size >= minSize) {
          return;
        }
      } catch (error) {
        // File doesn't exist yet, keep waiting
      }
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    // After max wait, proceed anyway if file exists
    if (existsSync(filePath)) {
      return;
    }

    throw new Error("File did not become available for playback");
  }
}
