import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// We need to test formatBytes (pure function) and the filesystem functions.
// For the filesystem functions, we can't easily change the CACHE_DIR constant,
// so we test formatBytes directly and test the others through their logic.

import { formatBytes } from "./cache";

describe("formatBytes", () => {
  test("returns '0 B' for 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  test("formats bytes correctly", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  test("formats kilobytes correctly", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  test("formats megabytes correctly", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(1572864)).toBe("1.5 MB");
  });

  test("formats gigabytes correctly", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  test("handles fractional values", () => {
    expect(formatBytes(1234)).toBe("1.21 KB");
  });

  test("handles large megabyte values", () => {
    const result = formatBytes(52428800); // 50 MB
    expect(result).toBe("50 MB");
  });
});

// Test cache filesystem functions using a temporary directory approach.
// Since the cache module uses a hardcoded CACHE_DIR, we test the module-level
// functions that are safe to call, and verify their behavior.

describe("cache module", () => {
  test("getCacheDir returns a path under home directory", async () => {
    const { getCacheDir } = await import("./cache");
    const dir = getCacheDir();
    expect(dir).toContain(".tuine");
    expect(dir).toContain("cache");
  });

  test("initCache creates the cache directory", async () => {
    const { initCache, getCacheDir } = await import("./cache");
    initCache();
    expect(existsSync(getCacheDir())).toBe(true);
  });

  test("getCachedPath returns null for non-existent video", async () => {
    const { getCachedPath, initCache } = await import("./cache");
    initCache();
    const result = getCachedPath("nonexistent_video_id_12345");
    expect(result).toBeNull();
  });

  test("isCached returns false for non-existent video", async () => {
    const { isCached, initCache } = await import("./cache");
    initCache();
    expect(isCached("nonexistent_video_id_12345")).toBe(false);
  });

  test("getCacheSize returns a number", async () => {
    const { getCacheSize, initCache } = await import("./cache");
    initCache();
    const size = getCacheSize();
    expect(typeof size).toBe("number");
    expect(size).toBeGreaterThanOrEqual(0);
  });
});
