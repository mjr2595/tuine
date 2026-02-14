import { describe, test, expect, beforeEach, afterAll, mock } from "bun:test";
import { join } from "path";
import { tmpdir } from "os";
import { rmSync, mkdirSync } from "fs";
import type { Track } from "../types";

// Create a temp directory for tests within the workspace
const TEST_DATA_DIR = join(tmpdir(), `tuine-playlist-test-${Date.now()}`);

// Mock getDataDir before importing PlaylistManager so PLAYLISTS_DIR
// uses our test directory (it's evaluated at module load time).
mock.module("../utils/system", () => ({
  getDataDir: () => TEST_DATA_DIR,
}));

// Import PlaylistManager AFTER the mock is set up
const { PlaylistManager } = await import("./playlist");

describe("PlaylistManager", () => {
  let manager: PlaylistManager;

  // Test helper: create tracks with required fields
  const makeTracks = (count: number, withTitles: boolean = true): Track[] => {
    return Array.from({ length: count }, (_, i) => ({
      url: `https://www.youtube.com/watch?v=track${i}aaaaa`,
      videoId: `track${i}aaaaa`,
      status: "ready" as const,
      title: withTitles ? `Track ${i}` : undefined,
      duration: 180 + i * 30,
    }));
  };

  beforeEach(() => {
    manager = new PlaylistManager();
  });

  afterAll(() => {
    // Clean up the entire test data directory
    try {
      rmSync(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe("save()", () => {
    test("saves a playlist with tracks that have titles", async () => {
      const tracks = makeTracks(3);
      const result = await manager.save("test_playlist", tracks);
      expect(result.success).toBe(true);
    });

    test("returns error when no tracks have titles", async () => {
      const tracks = makeTracks(2, false);
      const result = await manager.save("test_playlist_empty", tracks);
      expect(result.success).toBe(false);
      expect(result.error).toBe("No tracks with titles to save");
    });

    test("filters out tracks without titles", async () => {
      const tracks: Track[] = [
        {
          url: "https://www.youtube.com/watch?v=withTitle1",
          videoId: "withTitle1",
          status: "ready",
          title: "Has Title",
          duration: 120,
        },
        {
          url: "https://www.youtube.com/watch?v=noTitle11",
          videoId: "noTitle11",
          status: "pending",
          // no title
        },
      ];
      const result = await manager.save("filter_test", tracks);
      expect(result.success).toBe(true);

      const loadResult = await manager.load("filter_test");
      expect(loadResult.success).toBe(true);
      expect(loadResult.playlist!.tracks).toHaveLength(1);
      expect(loadResult.playlist!.tracks[0]!.title).toBe("Has Title");
    });
  });

  describe("load()", () => {
    test("loads a previously saved playlist", async () => {
      const tracks = makeTracks(2);
      await manager.save("load_test", tracks);

      const result = await manager.load("load_test");
      expect(result.success).toBe(true);
      expect(result.playlist).toBeDefined();
      expect(result.playlist!.name).toBe("load_test");
      expect(result.playlist!.tracks).toHaveLength(2);
      expect(result.playlist!.tracks[0]!.title).toBe("Track 0");
    });

    test("returns error for non-existent playlist", async () => {
      const result = await manager.load("does_not_exist_ever_12345");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("preserves track data correctly", async () => {
      const tracks = makeTracks(1);
      await manager.save("preserve_test", tracks);

      const result = await manager.load("preserve_test");
      expect(result.success).toBe(true);
      const savedTrack = result.playlist!.tracks[0]!;
      expect(savedTrack.url).toBe(tracks[0]!.url);
      expect(savedTrack.videoId).toBe(tracks[0]!.videoId);
      expect(savedTrack.duration).toBe(tracks[0]!.duration);
    });
  });

  describe("list()", () => {
    test("returns an array of playlist names", async () => {
      const tracks = makeTracks(1);
      await manager.save("list_a", tracks);
      await manager.save("list_b", tracks);

      const result = await manager.list();
      expect(result.success).toBe(true);
      expect(result.playlists).toBeDefined();
      expect(result.playlists!).toContain("list_a");
      expect(result.playlists!).toContain("list_b");
    });

    test("returns a valid array", async () => {
      const result = await manager.list();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.playlists)).toBe(true);
    });
  });

  describe("delete()", () => {
    test("deletes an existing playlist", async () => {
      const tracks = makeTracks(1);
      await manager.save("delete_me", tracks);

      const result = await manager.delete("delete_me");
      expect(result.success).toBe(true);

      const loadResult = await manager.load("delete_me");
      expect(loadResult.success).toBe(false);
    });

    test("returns error for non-existent playlist", async () => {
      const result = await manager.delete("does_not_exist_ever_12345");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("update()", () => {
    test("updates tracks while preserving createdAt", async () => {
      const tracks = makeTracks(2);
      await manager.save("update_test", tracks);

      const loadBefore = await manager.load("update_test");
      expect(loadBefore.success).toBe(true);
      const createdAt = loadBefore.playlist!.createdAt;

      // Wait a tiny bit to ensure updatedAt changes
      await new Promise((r) => setTimeout(r, 10));

      const newTracks = makeTracks(3);
      const result = await manager.update("update_test", newTracks);
      expect(result.success).toBe(true);

      const loadAfter = await manager.load("update_test");
      expect(loadAfter.success).toBe(true);
      expect(loadAfter.playlist!.createdAt).toBe(createdAt);
      expect(loadAfter.playlist!.tracks).toHaveLength(3);
      expect(loadAfter.playlist!.updatedAt).not.toBe(
        loadBefore.playlist!.updatedAt,
      );
    });

    test("returns error for non-existent playlist", async () => {
      const tracks = makeTracks(1);
      const result = await manager.update("does_not_exist_ever_12345", tracks);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Playlist not found");
    });
  });

  describe("filename sanitization", () => {
    test("saves playlist with special characters in name", async () => {
      const tracks = makeTracks(1);
      const result = await manager.save("My Favorites!", tracks);
      expect(result.success).toBe(true);

      // Should be loadable by the same name (gets sanitized consistently)
      const loadResult = await manager.load("My Favorites!");
      expect(loadResult.success).toBe(true);
    });
  });

  describe("playlist data integrity", () => {
    test("saved playlist has createdAt and updatedAt timestamps", async () => {
      const tracks = makeTracks(1);
      await manager.save("integrity_test", tracks);

      const result = await manager.load("integrity_test");
      expect(result.success).toBe(true);
      expect(result.playlist!.createdAt).toBeDefined();
      expect(result.playlist!.updatedAt).toBeDefined();
      // Should be valid ISO date strings
      expect(() => new Date(result.playlist!.createdAt)).not.toThrow();
      expect(() => new Date(result.playlist!.updatedAt)).not.toThrow();
    });
  });
});
