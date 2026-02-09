import { spawn } from "bun";
import type { VideoMetadata } from "../types";

export async function fetchMetadata(
  url: string,
): Promise<VideoMetadata | null> {
  try {
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
      return null;
    }

    const [id, title, durationStr, ext] = metadataText.trim().split("|||");

    return {
      id: id || "",
      title: title || "Unknown",
      duration: parseInt(durationStr || "0") || 0,
      ext: ext || "opus",
    };
  } catch (error) {
    console.error("Failed to fetch metadata:", error);
    return null;
  }
}
