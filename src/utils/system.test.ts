import { describe, test, expect } from "bun:test";
import {
  getDataDir,
  getInstallationInstructions,
  getAudioPlayer,
  type SystemCheck,
} from "./system";
import { homedir } from "node:os";
import { join } from "node:path";

describe("getDataDir()", () => {
  test("returns a string path", () => {
    const dir = getDataDir();
    expect(typeof dir).toBe("string");
  });

  test("path ends with /tuine", () => {
    const dir = getDataDir();
    expect(dir.endsWith("/tuine") || dir.endsWith("\\tuine")).toBe(true);
  });

  test("uses XDG_DATA_HOME if set", () => {
    const original = process.env.XDG_DATA_HOME;
    try {
      process.env.XDG_DATA_HOME = "/tmp/test_xdg_data";
      // Need to re-import to pick up env change - but since it reads env
      // at call time, we can just call it
      const dir = getDataDir();
      expect(dir).toBe("/tmp/test_xdg_data/tuine");
    } finally {
      if (original !== undefined) {
        process.env.XDG_DATA_HOME = original;
      } else {
        delete process.env.XDG_DATA_HOME;
      }
    }
  });

  test("uses default ~/.local/share path when XDG_DATA_HOME is not set", () => {
    const original = process.env.XDG_DATA_HOME;
    try {
      delete process.env.XDG_DATA_HOME;
      const dir = getDataDir();
      expect(dir).toBe(join(homedir(), ".local", "share", "tuine"));
    } finally {
      if (original !== undefined) {
        process.env.XDG_DATA_HOME = original;
      }
    }
  });
});

describe("getInstallationInstructions()", () => {
  test("returns empty array when all tools are available", () => {
    const check: SystemCheck = {
      ytdlp: true,
      audioPlayer: "ffplay",
      ffmpeg: true,
    };
    const instructions = getInstallationInstructions(check);
    expect(instructions).toEqual([]);
  });

  test("includes yt-dlp instruction when missing", () => {
    const check: SystemCheck = {
      ytdlp: false,
      audioPlayer: "ffplay",
      ffmpeg: true,
    };
    const instructions = getInstallationInstructions(check);
    expect(instructions.some((i) => i.includes("yt-dlp"))).toBe(true);
  });

  test("includes audio player instruction when missing", () => {
    const check: SystemCheck = {
      ytdlp: true,
      audioPlayer: null,
      ffmpeg: true,
    };
    const instructions = getInstallationInstructions(check);
    expect(instructions.some((i) => i.includes("audio player"))).toBe(true);
  });

  test("includes ffmpeg instruction when missing", () => {
    const check: SystemCheck = {
      ytdlp: true,
      audioPlayer: "ffplay",
      ffmpeg: false,
    };
    const instructions = getInstallationInstructions(check);
    expect(instructions.some((i) => i.includes("ffmpeg"))).toBe(true);
  });

  test("returns multiple instructions when multiple tools missing", () => {
    const check: SystemCheck = {
      ytdlp: false,
      audioPlayer: null,
      ffmpeg: false,
    };
    const instructions = getInstallationInstructions(check);
    expect(instructions.length).toBe(3);
  });
});

describe("getAudioPlayer()", () => {
  test("returns ffplay when available", () => {
    const check: SystemCheck = {
      ytdlp: true,
      audioPlayer: "ffplay",
      ffmpeg: true,
    };
    expect(getAudioPlayer(check)).toBe("ffplay");
  });

  test("returns afplay when available", () => {
    const check: SystemCheck = {
      ytdlp: true,
      audioPlayer: "afplay",
      ffmpeg: true,
    };
    expect(getAudioPlayer(check)).toBe("afplay");
  });

  test("returns null when no audio player is available", () => {
    const check: SystemCheck = {
      ytdlp: true,
      audioPlayer: null,
      ffmpeg: true,
    };
    expect(getAudioPlayer(check)).toBeNull();
  });
});

describe("checkSystemRequirements()", () => {
  // This test actually runs system commands, so it's more of an integration test
  test("returns a SystemCheck object", async () => {
    const { checkSystemRequirements } = await import("./system");
    const result = await checkSystemRequirements();

    expect(result).toHaveProperty("ytdlp");
    expect(result).toHaveProperty("audioPlayer");
    expect(result).toHaveProperty("ffmpeg");

    expect(typeof result.ytdlp).toBe("boolean");
    expect(typeof result.ffmpeg).toBe("boolean");
    expect(
      result.audioPlayer === null ||
        result.audioPlayer === "ffplay" ||
        result.audioPlayer === "afplay",
    ).toBe(true);
  });
});
