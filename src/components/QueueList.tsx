import React from "react";
import { Box, Text } from "ink";
import type { Track } from "../types";

interface QueueListProps {
  tracks: Track[];
  currentIndex: number;
}

export const QueueList: React.FC<QueueListProps> = ({
  tracks,
  currentIndex,
}) => {
  const statusIcon = {
    pending: "○",
    downloading: "⬇",
    ready: "✓",
    playing: "▶",
    error: "✗",
  };

  const statusColor = {
    pending: "gray",
    downloading: "yellow",
    ready: "green",
    playing: "cyan",
    error: "red",
  };

  return (
    <Box
      flexDirection="column"
      paddingY={1}
      borderStyle="round"
      borderColor="blue"
      width="100%"
    >
      <Box paddingX={2}>
        <Text bold color="blue">
          Queue ({tracks.length} tracks)
        </Text>
      </Box>

      {tracks.length === 0 ? (
        <Box paddingX={2} marginTop={1}>
          <Text dimColor>No tracks in queue. Add a YouTube URL below.</Text>
        </Box>
      ) : (
        <Box flexDirection="column" paddingX={2} marginTop={1}>
          {tracks.map((track, index) => (
            <Box key={track.videoId} marginY={0}>
              <Text
                bold={index === currentIndex}
                color={index === currentIndex ? "cyan" : undefined}
                dimColor={index !== currentIndex}
              >
                {statusIcon[track.status]} {index + 1}.{" "}
                {track.title || track.videoId}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
