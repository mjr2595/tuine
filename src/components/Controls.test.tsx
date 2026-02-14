import { describe, test, expect } from "bun:test";
import React from "react";
import { render } from "ink-testing-library";
import { Controls } from "./Controls";

describe("Controls", () => {
  test("renders without crashing", () => {
    const { lastFrame } = render(<Controls />);
    expect(lastFrame()).toBeDefined();
  });

  test("displays the Controls title", () => {
    const { lastFrame } = render(<Controls />);
    expect(lastFrame()).toContain("Controls");
  });

  test("shows Space shortcut", () => {
    const { lastFrame } = render(<Controls />);
    expect(lastFrame()).toContain("Space");
    expect(lastFrame()).toContain("Play/Pause");
  });

  test("shows Next track shortcut", () => {
    const { lastFrame } = render(<Controls />);
    expect(lastFrame()).toContain("n");
    expect(lastFrame()).toContain("Next track");
  });

  test("shows Previous track shortcut", () => {
    const { lastFrame } = render(<Controls />);
    expect(lastFrame()).toContain("p");
    expect(lastFrame()).toContain("Previous track");
  });

  test("shows Clear queue shortcut", () => {
    const { lastFrame } = render(<Controls />);
    expect(lastFrame()).toContain("c");
    expect(lastFrame()).toContain("Clear queue");
  });

  test("shows Save playlist shortcut", () => {
    const { lastFrame } = render(<Controls />);
    expect(lastFrame()).toContain("s");
    expect(lastFrame()).toContain("Save");
  });

  test("shows Load playlist shortcut", () => {
    const { lastFrame } = render(<Controls />);
    expect(lastFrame()).toContain("l");
    expect(lastFrame()).toContain("Load");
  });

  test("shows Shuffle shortcut", () => {
    const { lastFrame } = render(<Controls />);
    expect(lastFrame()).toContain("r");
    expect(lastFrame()).toContain("shuffle");
  });

  test("shows Quit shortcut", () => {
    const { lastFrame } = render(<Controls />);
    expect(lastFrame()).toContain("q");
    expect(lastFrame()).toContain("Quit");
  });
});
