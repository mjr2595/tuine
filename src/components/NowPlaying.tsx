import React from "react";
import { Box, Text } from "ink";
import type { Track } from "../types";

interface NowPlayingProps {
  track: Track | null;
  progress?: number; // Download percentage (0-100) or playback seconds elapsed
}

export const NowPlaying: React.FC<NowPlayingProps> = ({
  track,
  progress = 0,
}) => {
  if (!track) {
    return (
      <Box
        flexDirection="column"
        paddingY={1}
        borderStyle="round"
        borderColor="gray"
      >
        <Box paddingX={2}>
          <Text dimColor>No track playing</Text>
        </Box>
      </Box>
    );
  }

  const renderProgressBar = (current: number, total: number) => {
    const barLength = 40;
    const percent = total > 0 ? current / total : 0;
    const filled = Math.round(percent * barLength);
    const empty = barLength - filled;

    return "█".repeat(filled) + "░".repeat(empty);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const statusIcon = {
    pending: "⏸",
    downloading: "⬇",
    ready: "▶",
    playing: "▶",
    error: "❌",
  };

  return (
    <Box
      flexDirection="column"
      paddingY={1}
      borderStyle="round"
      borderColor="green"
    >
      <Box paddingX={2} flexDirection="column">
        <Box>
          <Text bold color="green">
            {statusIcon[track.status]} Now Playing
          </Text>
        </Box>

        <Box marginTop={1}>
          <Text color="cyan">{track.title || track.videoId}</Text>
        </Box>

        {track.status === "downloading" && (
          <Box marginTop={1}>
            <Text dimColor>Downloading: {progress.toFixed(1)}%</Text>
          </Box>
        )}

        {track.status === "playing" && track.duration && (
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>{renderProgressBar(progress, track.duration)}</Text>
            <Text dimColor>
              {formatDuration(progress)} / {formatDuration(track.duration)}
            </Text>
          </Box>
        )}

        {track.status === "error" && (
          <Box marginTop={1}>
            <Text color="red">{track.error || "Unknown error"}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
