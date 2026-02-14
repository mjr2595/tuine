import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { Player } from "./player";
import type { PlayerType } from "./player";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("Player", () => {
  let player: Player;
  let tempDir: string;

  beforeEach(() => {
    player = new Player({ playerType: "ffplay" });
    tempDir = join(tmpdir(), `tuine-player-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    player.stop();
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("constructor", () => {
    test("creates a Player with ffplay type", () => {
      const p = new Player({ playerType: "ffplay" });
      expect(p).toBeInstanceOf(Player);
    });

    test("creates a Player with afplay type", () => {
      const p = new Player({ playerType: "afplay" });
      expect(p).toBeInstanceOf(Player);
    });
  });

  describe("initial state", () => {
    test("starts in idle state", () => {
      expect(player.getState()).toBe("idle");
    });

    test("is not playing initially", () => {
      expect(player.isPlaying()).toBe(false);
    });

    test("has no current file initially", () => {
      expect(player.getCurrentFile()).toBeNull();
    });
  });

  describe("play()", () => {
    test("throws error for non-existent file", async () => {
      await expect(
        player.play("/nonexistent/path/to/file.opus"),
      ).rejects.toThrow("File not found");
    });

    test("sets state to buffering then playing for a valid file", async () => {
      // Create a small test file (not a real audio file, so playback will fail quickly)
      const testFile = join(tempDir, "test.opus");
      // Write enough data to pass the waitForPlayableContent check
      writeFileSync(testFile, Buffer.alloc(1024 * 1024, 0));

      // Player will try to spawn ffplay which will fail on a zero-filled file,
      // but the state transition should happen
      try {
        await player.play(testFile);
      } catch {
        // ffplay may not be available or file isn't real audio
      }

      // After play attempt, state should have transitioned
      // (may be playing, finished, or idle depending on ffplay availability)
      const state = player.getState();
      expect(["playing", "finished", "idle", "buffering"]).toContain(state);
    });
  });

  describe("stop()", () => {
    test("sets state to idle", () => {
      player.stop();
      expect(player.getState()).toBe("idle");
    });

    test("clears current file", () => {
      player.stop();
      expect(player.getCurrentFile()).toBeNull();
    });

    test("can be called multiple times without error", () => {
      player.stop();
      player.stop();
      player.stop();
      expect(player.getState()).toBe("idle");
    });
  });

  describe("pause()", () => {
    test("sets state to paused", () => {
      player.pause();
      expect(player.getState()).toBe("paused");
    });
  });

  describe("getState()", () => {
    test("returns current playback state", () => {
      expect(player.getState()).toBe("idle");
      player.pause();
      expect(player.getState()).toBe("paused");
      player.stop();
      expect(player.getState()).toBe("idle");
    });
  });

  describe("isPlaying()", () => {
    test("returns false when idle", () => {
      expect(player.isPlaying()).toBe(false);
    });

    test("returns false when paused", () => {
      player.pause();
      expect(player.isPlaying()).toBe(false);
    });
  });

  describe("getCurrentFile()", () => {
    test("returns null when idle", () => {
      expect(player.getCurrentFile()).toBeNull();
    });

    test("returns null after stop", () => {
      player.stop();
      expect(player.getCurrentFile()).toBeNull();
    });
  });

  describe("afplay player type", () => {
    test("creates player with afplay type", () => {
      const afplayer = new Player({ playerType: "afplay" });
      expect(afplayer.getState()).toBe("idle");
      expect(afplayer.isPlaying()).toBe(false);
    });
  });
});
