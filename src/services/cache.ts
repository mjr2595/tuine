import { join } from "path";
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "fs";
import { homedir } from "os";

const CACHE_DIR = join(homedir(), ".tuine", "cache");

export function initCache(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function getCacheDir(): string {
  return CACHE_DIR;
}

export function getCachedPath(videoId: string): string | null {
  if (!existsSync(CACHE_DIR)) {
    return null;
  }

  const files = readdirSync(CACHE_DIR);
  const cached = files.find((file) => file.startsWith(videoId));

  return cached ? join(CACHE_DIR, cached) : null;
}

export function isCached(videoId: string): boolean {
  return getCachedPath(videoId) !== null;
}

export function getCacheSize(): number {
  if (!existsSync(CACHE_DIR)) {
    return 0;
  }

  let totalSize = 0;
  const files = readdirSync(CACHE_DIR);

  for (const file of files) {
    const filePath = join(CACHE_DIR, file);
    const stats = statSync(filePath);
    totalSize += stats.size;
  }

  return totalSize;
}

export function clearCache(): void {
  if (!existsSync(CACHE_DIR)) {
    return;
  }

  const files = readdirSync(CACHE_DIR);

  for (const file of files) {
    const filePath = join(CACHE_DIR, file);
    unlinkSync(filePath);
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
