import { describe, test, expect } from "bun:test";
import React from "react";
import { render } from "ink-testing-library";
import { QueueList } from "./QueueList";
import type { Track } from "../types";

describe("QueueList", () => {
  describe("empty queue", () => {
    test("renders without crashing", () => {
      const { lastFrame } = render(<QueueList tracks={[]} currentIndex={-1} />);
      expect(lastFrame()).toBeDefined();
    });

    test("shows 0 tracks count", () => {
      const { lastFrame } = render(<QueueList tracks={[]} currentIndex={-1} />);
      expect(lastFrame()).toContain("0 tracks");
    });

    test("shows empty queue message", () => {
      const { lastFrame } = render(<QueueList tracks={[]} currentIndex={-1} />);
      expect(lastFrame()).toContain("No tracks in queue");
    });
  });

  describe("with tracks", () => {
    const tracks: Track[] = [
      {
        url: "https://www.youtube.com/watch?v=track1",
        videoId: "track1",
        status: "playing",
        title: "First Song",
      },
      {
        url: "https://www.youtube.com/watch?v=track2",
        videoId: "track2",
        status: "pending",
        title: "Second Song",
      },
      {
        url: "https://www.youtube.com/watch?v=track3",
        videoId: "track3",
        status: "downloading",
        title: "Third Song",
      },
    ];

    test("shows track count", () => {
      const { lastFrame } = render(
        <QueueList tracks={tracks} currentIndex={0} />,
      );
      expect(lastFrame()).toContain("3 tracks");
    });

    test("shows track titles", () => {
      const { lastFrame } = render(
        <QueueList tracks={tracks} currentIndex={0} />,
      );
      expect(lastFrame()).toContain("First Song");
      expect(lastFrame()).toContain("Second Song");
      expect(lastFrame()).toContain("Third Song");
    });

    test("shows status icons for each track", () => {
      const { lastFrame } = render(
        <QueueList tracks={tracks} currentIndex={0} />,
      );
      expect(lastFrame()).toContain("▶"); // playing
      expect(lastFrame()).toContain("○"); // pending
      expect(lastFrame()).toContain("⬇"); // downloading
    });

    test("shows track numbers", () => {
      const { lastFrame } = render(
        <QueueList tracks={tracks} currentIndex={0} />,
      );
      expect(lastFrame()).toContain("1.");
      expect(lastFrame()).toContain("2.");
      expect(lastFrame()).toContain("3.");
    });
  });

  describe("status icons", () => {
    test("shows ✓ for ready status", () => {
      const tracks: Track[] = [
        {
          url: "https://www.youtube.com/watch?v=ready1",
          videoId: "ready1",
          status: "ready",
          title: "Ready Track",
        },
      ];
      const { lastFrame } = render(
        <QueueList tracks={tracks} currentIndex={0} />,
      );
      expect(lastFrame()).toContain("✓");
    });

    test("shows ✗ for error status", () => {
      const tracks: Track[] = [
        {
          url: "https://www.youtube.com/watch?v=error1",
          videoId: "error1",
          status: "error",
          title: "Error Track",
          error: "Failed",
        },
      ];
      const { lastFrame } = render(
        <QueueList tracks={tracks} currentIndex={0} />,
      );
      expect(lastFrame()).toContain("✗");
    });
  });

  describe("track without title", () => {
    test("falls back to videoId", () => {
      const tracks: Track[] = [
        {
          url: "https://www.youtube.com/watch?v=notitle1",
          videoId: "notitle1",
          status: "pending",
        },
      ];
      const { lastFrame } = render(
        <QueueList tracks={tracks} currentIndex={0} />,
      );
      expect(lastFrame()).toContain("notitle1");
    });
  });

  describe("Queue header", () => {
    test("displays 'Queue' in the header", () => {
      const { lastFrame } = render(<QueueList tracks={[]} currentIndex={-1} />);
      expect(lastFrame()).toContain("Queue");
    });
  });
});
