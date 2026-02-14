import { describe, test, expect, beforeEach } from "bun:test";
import { QueueManager } from "./queue";

describe("QueueManager", () => {
  let queue: QueueManager;

  beforeEach(() => {
    queue = new QueueManager();
  });

  describe("add()", () => {
    test("accepts a valid youtube.com URL with v param", () => {
      const result = queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(result.success).toBe(true);
      expect(result.videoId).toBe("dQw4w9WgXcQ");
    });

    test("accepts a valid youtube.com URL without www", () => {
      const result = queue.add("https://youtube.com/watch?v=dQw4w9WgXcQ");
      expect(result.success).toBe(true);
      expect(result.videoId).toBe("dQw4w9WgXcQ");
    });

    test("accepts a valid youtu.be short URL", () => {
      const result = queue.add("https://youtu.be/dQw4w9WgXcQ");
      expect(result.success).toBe(true);
      expect(result.videoId).toBe("dQw4w9WgXcQ");
    });

    test("rejects an invalid URL", () => {
      const result = queue.add("not-a-url");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("rejects a non-YouTube URL", () => {
      const result = queue.add("https://www.google.com/watch?v=abc123");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid YouTube URL");
    });

    test("rejects a youtube.com URL without v param", () => {
      const result = queue.add("https://www.youtube.com/");
      expect(result.success).toBe(false);
    });

    test("rejects duplicate video IDs", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      const result = queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Video already in queue");
    });

    test("rejects same video via different URL formats", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      const result = queue.add("https://youtu.be/dQw4w9WgXcQ");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Video already in queue");
    });

    test("creates track with pending status", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      const tracks = queue.getAll();
      expect(tracks).toHaveLength(1);
      expect(tracks[0]!.status).toBe("pending");
      expect(tracks[0]!.videoId).toBe("dQw4w9WgXcQ");
    });

    test("sets currentIndex to 0 on first add", () => {
      expect(queue.getCurrentIndex()).toBe(-1);
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(queue.getCurrentIndex()).toBe(0);
    });

    test("does not change currentIndex on subsequent adds", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      queue.add("https://www.youtube.com/watch?v=abc123def45");
      expect(queue.getCurrentIndex()).toBe(0);
    });

    test("accepts URL with extra query params", () => {
      const result = queue.add(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLtest&index=1",
      );
      expect(result.success).toBe(true);
      expect(result.videoId).toBe("dQw4w9WgXcQ");
    });
  });

  describe("remove()", () => {
    test("removes a track at valid index", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      queue.add("https://www.youtube.com/watch?v=abc123def45");
      expect(queue.remove(0)).toBe(true);
      expect(queue.getAll()).toHaveLength(1);
      expect(queue.getAll()[0]!.videoId).toBe("abc123def45");
    });

    test("returns false for negative index", () => {
      expect(queue.remove(-1)).toBe(false);
    });

    test("returns false for index beyond queue length", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(queue.remove(5)).toBe(false);
    });

    test("adjusts currentIndex when it exceeds new queue length", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      queue.add("https://www.youtube.com/watch?v=abc123def45");
      queue.next(); // currentIndex = 1
      queue.remove(1); // remove the track at index 1
      expect(queue.getCurrentIndex()).toBe(0);
    });
  });

  describe("next()", () => {
    test("advances to the next track in sequential mode", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      const next = queue.next();
      expect(next).not.toBeNull();
      expect(next!.videoId).toBe("track2aaaaaa");
      expect(queue.getCurrentIndex()).toBe(1);
    });

    test("returns null when at the end of the queue", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      const next = queue.next();
      expect(next).toBeNull();
    });

    test("returns null on empty queue", () => {
      expect(queue.next()).toBeNull();
    });
  });

  describe("previous()", () => {
    test("goes back to the previous track", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.next(); // now at index 1
      const prev = queue.previous();
      expect(prev).not.toBeNull();
      expect(prev!.videoId).toBe("track1aaaaaa");
      expect(queue.getCurrentIndex()).toBe(0);
    });

    test("returns null when at the beginning", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      const prev = queue.previous();
      expect(prev).toBeNull();
    });

    test("returns null on empty queue", () => {
      expect(queue.previous()).toBeNull();
    });
  });

  describe("getCurrent()", () => {
    test("returns null when queue is empty", () => {
      expect(queue.getCurrent()).toBeNull();
    });

    test("returns the current track after adding", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      const current = queue.getCurrent();
      expect(current).not.toBeNull();
      expect(current!.videoId).toBe("dQw4w9WgXcQ");
    });

    test("updates after next()", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.next();
      expect(queue.getCurrent()!.videoId).toBe("track2aaaaaa");
    });
  });

  describe("getAll()", () => {
    test("returns empty array when queue is empty", () => {
      expect(queue.getAll()).toEqual([]);
    });

    test("returns a copy of the queue", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      const all = queue.getAll();
      all.push({
        url: "fake",
        videoId: "fake",
        status: "pending",
      });
      expect(queue.getAll()).toHaveLength(1);
    });

    test("returns all tracks in order", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track3aaaaaa");
      const all = queue.getAll();
      expect(all).toHaveLength(3);
      expect(all[0]!.videoId).toBe("track1aaaaaa");
      expect(all[1]!.videoId).toBe("track2aaaaaa");
      expect(all[2]!.videoId).toBe("track3aaaaaa");
    });
  });

  describe("updateTrack()", () => {
    test("updates track properties by videoId", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      queue.updateTrack("dQw4w9WgXcQ", {
        title: "Never Gonna Give You Up",
        status: "downloading",
      });
      const track = queue.getCurrent();
      expect(track!.title).toBe("Never Gonna Give You Up");
      expect(track!.status).toBe("downloading");
    });

    test("does nothing for non-existent videoId", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      queue.updateTrack("nonexistent", { title: "test" });
      expect(queue.getCurrent()!.title).toBeUndefined();
    });

    test("can update filePath and error", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      queue.updateTrack("dQw4w9WgXcQ", {
        filePath: "/tmp/test.opus",
        status: "ready",
      });
      const track = queue.getCurrent();
      expect(track!.filePath).toBe("/tmp/test.opus");
      expect(track!.status).toBe("ready");
    });
  });

  describe("clear()", () => {
    test("removes all tracks", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.clear();
      expect(queue.getAll()).toEqual([]);
      expect(queue.getCurrentIndex()).toBe(-1);
      expect(queue.getCurrent()).toBeNull();
    });

    test("can add tracks again after clearing", () => {
      queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      queue.clear();
      const result = queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(result.success).toBe(true);
    });
  });

  describe("hasNext()", () => {
    test("returns false on empty queue", () => {
      expect(queue.hasNext()).toBe(false);
    });

    test("returns true when there are more tracks", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      expect(queue.hasNext()).toBe(true);
    });

    test("returns false when at the last track", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      expect(queue.hasNext()).toBe(false);
    });
  });

  describe("hasPrevious()", () => {
    test("returns false on empty queue", () => {
      expect(queue.hasPrevious()).toBe(false);
    });

    test("returns false when at the first track", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      expect(queue.hasPrevious()).toBe(false);
    });

    test("returns true when not at the first track", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.next();
      expect(queue.hasPrevious()).toBe(true);
    });
  });

  describe("shuffle mode", () => {
    test("shuffle is disabled by default", () => {
      expect(queue.isShuffleEnabled()).toBe(false);
    });

    test("toggleShuffle enables and returns true", () => {
      const result = queue.toggleShuffle();
      expect(result).toBe(true);
      expect(queue.isShuffleEnabled()).toBe(true);
    });

    test("toggleShuffle twice disables and returns false", () => {
      queue.toggleShuffle();
      const result = queue.toggleShuffle();
      expect(result).toBe(false);
      expect(queue.isShuffleEnabled()).toBe(false);
    });

    test("next() in shuffle mode returns a track", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track3aaaaaa");
      queue.toggleShuffle();
      const next = queue.next();
      expect(next).not.toBeNull();
    });

    test("next() in shuffle mode eventually returns null after all tracks played", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.toggleShuffle();

      // With 2 tracks, 1 is current so only 1 unplayed
      const first = queue.next();
      expect(first).not.toBeNull();

      const second = queue.next();
      expect(second).toBeNull();
    });

    test("previous() in shuffle mode goes back through history", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track3aaaaaa");
      queue.toggleShuffle();

      const startId = queue.getCurrent()!.videoId;
      queue.next(); // go to a random track
      const prev = queue.previous();
      expect(prev).not.toBeNull();
      expect(prev!.videoId).toBe(startId);
    });

    test("previous() returns null with no shuffle history", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.toggleShuffle();
      expect(queue.previous()).toBeNull();
    });

    test("hasNext() in shuffle mode checks unplayed indices", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.toggleShuffle();
      expect(queue.hasNext()).toBe(true);

      queue.next(); // play the only unplayed track
      expect(queue.hasNext()).toBe(false);
    });

    test("hasPrevious() in shuffle mode checks history", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.toggleShuffle();
      expect(queue.hasPrevious()).toBe(false);

      queue.next();
      expect(queue.hasPrevious()).toBe(true);
    });

    test("enabling shuffle excludes current track from unplayed", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track3aaaaaa");
      queue.toggleShuffle();

      // All nexts should not return the current track again (track1aaaaaa at index 0)
      const seen = new Set<string>();
      seen.add(queue.getCurrent()!.videoId);

      let next = queue.next();
      while (next) {
        expect(seen.has(next.videoId)).toBe(false);
        seen.add(next.videoId);
        next = queue.next();
      }
      expect(seen.size).toBe(3);
    });

    test("disabling shuffle clears shuffle state", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track3aaaaaa");
      queue.toggleShuffle();
      queue.next();

      // Disable shuffle
      queue.toggleShuffle();

      // hasPrevious should now use sequential logic
      // Current index after shuffling could be anything, but hasPrevious
      // checks currentIndex > 0
      expect(queue.isShuffleEnabled()).toBe(false);
    });

    test("adding track during shuffle adds to unplayed indices", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.toggleShuffle();

      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      expect(queue.hasNext()).toBe(true);
    });
  });

  describe("navigation edge cases", () => {
    test("multiple next() calls stop at end", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.next(); // 0 -> 1
      queue.next(); // at end, returns null
      expect(queue.getCurrentIndex()).toBe(1);
    });

    test("multiple previous() calls stop at start", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.next();
      queue.previous(); // 1 -> 0
      queue.previous(); // at start, returns null
      expect(queue.getCurrentIndex()).toBe(0);
    });

    test("forward and backward navigation", () => {
      queue.add("https://www.youtube.com/watch?v=track1aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track2aaaaaa");
      queue.add("https://www.youtube.com/watch?v=track3aaaaaa");

      queue.next(); // -> track2
      queue.next(); // -> track3
      expect(queue.getCurrent()!.videoId).toBe("track3aaaaaa");

      queue.previous(); // -> track2
      expect(queue.getCurrent()!.videoId).toBe("track2aaaaaa");

      queue.previous(); // -> track1
      expect(queue.getCurrent()!.videoId).toBe("track1aaaaaa");
    });
  });

  describe("video ID extraction", () => {
    test("extracts ID from standard youtube.com URL", () => {
      const result = queue.add("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(result.videoId).toBe("dQw4w9WgXcQ");
    });

    test("extracts ID from youtu.be URL", () => {
      const result = queue.add("https://youtu.be/dQw4w9WgXcQ");
      expect(result.videoId).toBe("dQw4w9WgXcQ");
    });

    test("extracts ID from URL with additional parameters", () => {
      const result = queue.add(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s",
      );
      expect(result.videoId).toBe("dQw4w9WgXcQ");
    });
  });
});
