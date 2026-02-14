import { describe, test, expect } from "bun:test";
import React from "react";
import { render } from "ink-testing-library";
import { UrlInput } from "./UrlInput";

describe("UrlInput", () => {
  test("renders without crashing", () => {
    const { lastFrame } = render(<UrlInput onSubmit={() => {}} />);
    expect(lastFrame()).toBeDefined();
  });

  test("shows 'Add YouTube URL' title", () => {
    const { lastFrame } = render(<UrlInput onSubmit={() => {}} />);
    expect(lastFrame()).toContain("Add YouTube URL");
  });

  test("shows URL label", () => {
    const { lastFrame } = render(<UrlInput onSubmit={() => {}} />);
    expect(lastFrame()).toContain("URL:");
  });

  test("shows error message when error prop is provided", () => {
    const { lastFrame } = render(
      <UrlInput onSubmit={() => {}} error="Invalid URL" />,
    );
    expect(lastFrame()).toContain("Invalid URL");
  });

  test("does not show error when error prop is not provided", () => {
    const { lastFrame } = render(<UrlInput onSubmit={() => {}} />);
    expect(lastFrame()).not.toContain("❌");
  });

  test("shows error icon with error message", () => {
    const { lastFrame } = render(
      <UrlInput onSubmit={() => {}} error="Something went wrong" />,
    );
    expect(lastFrame()).toContain("❌");
    expect(lastFrame()).toContain("Something went wrong");
  });
});
