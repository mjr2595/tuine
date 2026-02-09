import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Playlist, PlaylistTrack, Track } from "../types";
import { getDataDir } from "../utils/system";

const PLAYLISTS_DIR = join(getDataDir(), "playlists");

export class PlaylistManager {
  private async ensurePlaylistsDir(): Promise<void> {
    try {
      await mkdir(PLAYLISTS_DIR, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9_\-\s]/g, "").replace(/\s+/g, "_");
  }

  private getPlaylistPath(name: string): string {
    const filename = this.sanitizeFilename(name) + ".json";
    return join(PLAYLISTS_DIR, filename);
  }

  async save(
    name: string,
    tracks: Track[],
  ): Promise<{ success: boolean; error?: string }> {
    await this.ensurePlaylistsDir();

    // Filter tracks to only include those with titles
    const playlistTracks: PlaylistTrack[] = tracks
      .filter((track) => track.title)
      .map((track) => ({
        url: track.url,
        videoId: track.videoId,
        title: track.title!,
        duration: track.duration,
      }));

    if (playlistTracks.length === 0) {
      return { success: false, error: "No tracks with titles to save" };
    }

    const now = new Date().toISOString();
    const playlist: Playlist = {
      name,
      tracks: playlistTracks,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const path = this.getPlaylistPath(name);
      await writeFile(path, JSON.stringify(playlist, null, 2), "utf-8");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to save playlist",
      };
    }
  }

  async load(
    name: string,
  ): Promise<{ success: boolean; playlist?: Playlist; error?: string }> {
    try {
      const path = this.getPlaylistPath(name);
      const content = await readFile(path, "utf-8");
      const playlist: Playlist = JSON.parse(content);
      return { success: true, playlist };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to load playlist",
      };
    }
  }

  async list(): Promise<{
    success: boolean;
    playlists?: string[];
    error?: string;
  }> {
    await this.ensurePlaylistsDir();

    try {
      const files = await readdir(PLAYLISTS_DIR);
      const playlists = files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.replace(".json", ""));
      return { success: true, playlists };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list playlists",
      };
    }
  }

  async delete(name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const path = this.getPlaylistPath(name);
      await unlink(path);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete playlist",
      };
    }
  }

  async update(
    name: string,
    tracks: Track[],
  ): Promise<{ success: boolean; error?: string }> {
    // Load existing playlist to preserve createdAt
    const loadResult = await this.load(name);
    if (!loadResult.success || !loadResult.playlist) {
      return { success: false, error: "Playlist not found" };
    }

    const playlistTracks: PlaylistTrack[] = tracks
      .filter((track) => track.title)
      .map((track) => ({
        url: track.url,
        videoId: track.videoId,
        title: track.title!,
        duration: track.duration,
      }));

    const playlist: Playlist = {
      name,
      tracks: playlistTracks,
      createdAt: loadResult.playlist.createdAt,
      updatedAt: new Date().toISOString(),
    };

    try {
      const path = this.getPlaylistPath(name);
      await writeFile(path, JSON.stringify(playlist, null, 2), "utf-8");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update playlist",
      };
    }
  }
}
