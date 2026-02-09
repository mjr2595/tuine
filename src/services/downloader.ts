import { spawn } from "bun";
import { join } from "path";
import type { VideoMetadata, DownloadProgress } from "../types";
import { getCacheDir } from "./cache";

export type DownloadEventType = "metadata" | "progress" | "complete" | "error";

export interface DownloadEvent {
  type: DownloadEventType;
  videoId: string;
  metadata?: VideoMetadata;
  progress?: DownloadProgress;
  filePath?: string;
  error?: string;
}

export type DownloadCallback = (event: DownloadEvent) => void;

export class Downloader {
  private activeDownloads = new Map<string, any>();

  async download(
    url: string,
    videoId: string,
    callback: DownloadCallback,
  ): Promise<void> {
    if (this.activeDownloads.has(videoId)) {
      callback({
        type: "error",
        videoId,
        error: "Download already in progress",
      });
      return;
    }

    const outputPath = join(getCacheDir(), `${videoId}.%(ext)s`);

    try {
      // First, get metadata
      const metadataProc = spawn(
        [
          "yt-dlp",
          "--print",
          "%(id)s|||%(title)s|||%(duration)s|||%(ext)s",
          "-f",
          "bestaudio",
          url,
        ],
        {
          stdout: "pipe",
          stderr: "pipe",
        },
      );

      const metadataText = await new Response(metadataProc.stdout).text();
      await metadataProc.exited;

      if (metadataProc.exitCode !== 0) {
        const error = await new Response(metadataProc.stderr).text();
        callback({
          type: "error",
          videoId,
          error: error || "Failed to fetch metadata",
        });
        return;
      }

      const [id, title, durationStr, ext] = metadataText.trim().split("|||");
      const metadata: VideoMetadata = {
        id: id || "",
        title: title || "Unknown",
        duration: parseInt(durationStr || "0") || 0,
        ext: ext || "opus",
      };

      callback({
        type: "metadata",
        videoId,
        metadata,
      });

      // Start download with progress
      const downloadProc = spawn(
        [
          "yt-dlp",
          "-f",
          "bestaudio",
          "-o",
          outputPath,
          "--newline",
          "--progress",
          url,
        ],
        {
          stdout: "pipe",
          stderr: "pipe",
        },
      );

      this.activeDownloads.set(videoId, downloadProc);

      // Read progress output
      const reader = downloadProc.stdout.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.includes("[download]")) {
            const progress = this.parseProgress(line, videoId);
            if (progress) {
              callback({
                type: "progress",
                videoId,
                progress,
              });
            }
          }
        }
      }

      await downloadProc.exited;

      if (downloadProc.exitCode === 0) {
        const filePath = join(getCacheDir(), `${videoId}.${metadata.ext}`);
        callback({
          type: "complete",
          videoId,
          filePath,
        });
      } else {
        const error = await new Response(downloadProc.stderr).text();
        callback({
          type: "error",
          videoId,
          error: error || "Download failed",
        });
      }
    } catch (error) {
      callback({
        type: "error",
        videoId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      this.activeDownloads.delete(videoId);
    }
  }

  cancel(videoId: string): void {
    const proc = this.activeDownloads.get(videoId);
    if (proc) {
      proc.kill();
      this.activeDownloads.delete(videoId);
    }
  }

  private parseProgress(
    line: string,
    videoId: string,
  ): DownloadProgress | null {
    // Example: [download]  45.0% of 3.50MiB at 1.23MiB/s ETA 00:02
    const match = line.match(
      /(\d+\.?\d*)%.*?of\s+([\d.]+\w+).*?at\s+([\d.]+\w+\/s).*?ETA\s+([\d:]+)/,
    );

    if (match) {
      return {
        videoId,
        percent: parseFloat(match[1] || "0"),
        downloaded: "",
        total: match[2] || "0B",
        speed: match[3] || "0B/s",
        eta: match[4] || "00:00",
      };
    }

    return null;
  }
}
