import { z } from "zod";
import type { Track } from "../types";

const youtubeUrlSchema = z.string().refine(
  (url) => {
    try {
      const urlObj = new URL(url);
      return (
        ((urlObj.hostname === "www.youtube.com" ||
          urlObj.hostname === "youtube.com") &&
          urlObj.searchParams.has("v")) ||
        urlObj.hostname === "youtu.be"
      );
    } catch {
      return false;
    }
  },
  { message: "Invalid YouTube URL" },
);

export class QueueManager {
  private queue: Track[] = [];
  private currentIndex: number = -1;

  add(url: string): { success: boolean; error?: string; videoId?: string } {
    const validation = youtubeUrlSchema.safeParse(url);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || "Invalid URL",
      };
    }

    const videoId = this.extractVideoId(url);
    if (!videoId) {
      return { success: false, error: "Could not extract video ID" };
    }

    // Check if already in queue
    if (this.queue.some((track) => track.videoId === videoId)) {
      return { success: false, error: "Video already in queue" };
    }

    const track: Track = {
      url,
      videoId,
      status: "pending",
    };

    this.queue.push(track);

    // If this is the first track, set it as current
    if (this.currentIndex === -1) {
      this.currentIndex = 0;
    }

    return { success: true, videoId };
  }

  remove(index: number): boolean {
    if (index < 0 || index >= this.queue.length) {
      return false;
    }

    this.queue.splice(index, 1);

    // Adjust current index if needed
    if (this.currentIndex >= this.queue.length) {
      this.currentIndex = this.queue.length - 1;
    }

    return true;
  }

  next(): Track | null {
    if (this.currentIndex < this.queue.length - 1) {
      this.currentIndex++;
      return this.queue[this.currentIndex] || null;
    }
    return null;
  }

  previous(): Track | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.queue[this.currentIndex] || null;
    }
    return null;
  }

  getCurrent(): Track | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
      return this.queue[this.currentIndex] || null;
    }
    return null;
  }

  getAll(): Track[] {
    return [...this.queue];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  updateTrack(videoId: string, updates: Partial<Track>): void {
    const track = this.queue.find((t) => t.videoId === videoId);
    if (track) {
      Object.assign(track, updates);
    }
  }

  clear(): void {
    this.queue = [];
    this.currentIndex = -1;
  }

  hasNext(): boolean {
    return this.currentIndex < this.queue.length - 1;
  }

  hasPrevious(): boolean {
    return this.currentIndex > 0;
  }

  private extractVideoId(url: string): string | null {
    try {
      const urlObj = new URL(url);

      // Handle youtu.be URLs
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }

      // Handle youtube.com URLs
      return urlObj.searchParams.get("v");
    } catch {
      return null;
    }
  }
}
