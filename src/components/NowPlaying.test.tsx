import { describe, test, expect } from "bun:test";
import React from "react";
import { render } from "ink-testing-library";
import { NowPlaying } from "./NowPlaying";
import type { Track } from "../types";

describe("NowPlaying", () => {
  describe("with no track", () => {
    test("renders without crashing", () => {
      const { lastFrame } = render(<NowPlaying track={null} />);
      expect(lastFrame()).toBeDefined();
    });

    test("shows 'No track playing' message", () => {
      const { lastFrame } = render(<NowPlaying track={null} />);
      expect(lastFrame()).toContain("No track playing");
    });
  });

  describe("with a pending track", () => {
    const track: Track = {
      url: "https://www.youtube.com/watch?v=abc123",
      videoId: "abc123",
      status: "pending",
      title: "Test Song",
    };

    test("renders the track title", () => {
      const { lastFrame } = render(<NowPlaying track={track} />);
      expect(lastFrame()).toContain("Test Song");
    });

    test("shows Now Playing text", () => {
      const { lastFrame } = render(<NowPlaying track={track} />);
      expect(lastFrame()).toContain("Now Playing");
    });
  });

  describe("with a downloading track", () => {
    const track: Track = {
      url: "https://www.youtube.com/watch?v=abc123",
      videoId: "abc123",
      status: "downloading",
      title: "Downloading Song",
    };

    test("shows download progress", () => {
      const { lastFrame } = render(
        <NowPlaying track={track} progress={45.5} />,
      );
      expect(lastFrame()).toContain("Downloading");
      expect(lastFrame()).toContain("45.5%");
    });

    test("shows 0% initially", () => {
      const { lastFrame } = render(<NowPlaying track={track} progress={0} />);
      expect(lastFrame()).toContain("0.0%");
    });
  });

  describe("with a playing track", () => {
    const track: Track = {
      url: "https://www.youtube.com/watch?v=abc123",
      videoId: "abc123",
      status: "playing",
      title: "Playing Song",
      duration: 300, // 5 minutes
    };

    test("shows the track title", () => {
      const { lastFrame } = render(<NowPlaying track={track} progress={60} />);
      expect(lastFrame()).toContain("Playing Song");
    });

    test("shows playback progress bar", () => {
      const { lastFrame } = render(<NowPlaying track={track} progress={150} />);
      // Should contain the progress bar characters
      expect(lastFrame()).toContain("█");
      expect(lastFrame()).toContain("░");
    });

    test("shows formatted time", () => {
      const { lastFrame } = render(<NowPlaying track={track} progress={65} />);
      // 65 seconds = 1:05
      expect(lastFrame()).toContain("1:05");
      // 300 seconds = 5:00
      expect(lastFrame()).toContain("5:00");
    });

    test("shows pause icon when paused", () => {
      const { lastFrame } = render(
        <NowPlaying track={track} progress={60} isPaused={true} />,
      );
      expect(lastFrame()).toContain("⏸");
    });

    test("shows play icon when not paused", () => {
      const { lastFrame } = render(
        <NowPlaying track={track} progress={60} isPaused={false} />,
      );
      expect(lastFrame()).toContain("▶");
    });
  });

  describe("with an error track", () => {
    test("shows error message", () => {
      const track: Track = {
        url: "https://www.youtube.com/watch?v=abc123",
        videoId: "abc123",
        status: "error",
        title: "Error Song",
        error: "Download failed",
      };
      const { lastFrame } = render(<NowPlaying track={track} />);
      expect(lastFrame()).toContain("Download failed");
    });

    test("shows 'Unknown error' when no error message", () => {
      const track: Track = {
        url: "https://www.youtube.com/watch?v=abc123",
        videoId: "abc123",
        status: "error",
        title: "Error Song",
      };
      const { lastFrame } = render(<NowPlaying track={track} />);
      expect(lastFrame()).toContain("Unknown error");
    });
  });

  describe("with a track that has no title", () => {
    test("falls back to videoId", () => {
      const track: Track = {
        url: "https://www.youtube.com/watch?v=abc123",
        videoId: "abc123",
        status: "pending",
      };
      const { lastFrame } = render(<NowPlaying track={track} />);
      expect(lastFrame()).toContain("abc123");
    });
  });

  describe("with a ready track", () => {
    test("shows the ready status icon", () => {
      const track: Track = {
        url: "https://www.youtube.com/watch?v=abc123",
        videoId: "abc123",
        status: "ready",
        title: "Ready Song",
      };
      const { lastFrame } = render(<NowPlaying track={track} />);
      expect(lastFrame()).toContain("▶");
    });
  });
});
