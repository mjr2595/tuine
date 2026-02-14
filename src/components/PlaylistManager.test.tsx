import { describe, test, expect } from "bun:test";
import React from "react";
import { render } from "ink-testing-library";
import { PlaylistManager } from "./PlaylistManager";

describe("PlaylistManager", () => {
  describe("save mode", () => {
    test("renders without crashing", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="save" playlists={[]} />,
      );
      expect(lastFrame()).toBeDefined();
    });

    test("shows save title", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="save" playlists={[]} />,
      );
      expect(lastFrame()).toContain("Save Playlist");
    });

    test("shows input prompt", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="save" playlists={[]} />,
      );
      expect(lastFrame()).toContain("Enter playlist name");
    });

    test("shows save and cancel instructions", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="save" playlists={[]} />,
      );
      expect(lastFrame()).toContain("Enter to save");
      expect(lastFrame()).toContain("Esc to cancel");
    });

    test("shows error message when error prop is set", () => {
      const { lastFrame } = render(
        <PlaylistManager
          mode="save"
          playlists={[]}
          error="No tracks to save"
        />,
      );
      expect(lastFrame()).toContain("No tracks to save");
    });
  });

  describe("load mode", () => {
    test("renders without crashing", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="load" playlists={["My Playlist"]} />,
      );
      expect(lastFrame()).toBeDefined();
    });

    test("shows load title", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="load" playlists={[]} />,
      );
      expect(lastFrame()).toContain("Load Playlist");
    });

    test("shows playlists", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="load" playlists={["Favorites", "Road Trip"]} />,
      );
      expect(lastFrame()).toContain("Favorites");
      expect(lastFrame()).toContain("Road Trip");
    });

    test("shows empty message when no playlists", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="load" playlists={[]} />,
      );
      expect(lastFrame()).toContain("No playlists saved yet");
    });

    test("shows navigation instructions", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="load" playlists={["Test"]} />,
      );
      expect(lastFrame()).toContain("Navigate");
      expect(lastFrame()).toContain("Enter to load");
      expect(lastFrame()).toContain("delete");
    });

    test("shows error when error prop is set", () => {
      const { lastFrame } = render(
        <PlaylistManager
          mode="load"
          playlists={[]}
          error="Failed to load playlist"
        />,
      );
      expect(lastFrame()).toContain("Failed to load playlist");
    });

    test("highlights the first playlist by default", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="load" playlists={["First", "Second"]} />,
      );
      // The selected item has a ▶ prefix
      expect(lastFrame()).toContain("▶");
    });
  });

  describe("list mode", () => {
    test("renders without crashing", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="list" playlists={[]} />,
      );
      expect(lastFrame()).toBeDefined();
    });

    test("shows playlists title", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="list" playlists={[]} />,
      );
      expect(lastFrame()).toContain("Playlists");
    });

    test("shows playlists in list", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="list" playlists={["Mix 1", "Mix 2"]} />,
      );
      expect(lastFrame()).toContain("Mix 1");
      expect(lastFrame()).toContain("Mix 2");
    });

    test("shows empty message when no playlists", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="list" playlists={[]} />,
      );
      expect(lastFrame()).toContain("No playlists saved yet");
    });

    test("shows close instruction", () => {
      const { lastFrame } = render(
        <PlaylistManager mode="list" playlists={[]} />,
      );
      expect(lastFrame()).toContain("Esc to close");
    });
  });
});
