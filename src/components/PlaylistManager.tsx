import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";

interface PlaylistManagerProps {
  mode: "save" | "load" | "list";
  playlists: string[];
  onSave?: (name: string) => void;
  onLoad?: (name: string) => void;
  onDelete?: (name: string) => void;
  onCancel?: () => void;
  error?: string;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  mode,
  playlists,
  onSave,
  onLoad,
  onDelete,
  onCancel,
  error,
}) => {
  const [input, setInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [playlists]);

  useInput(
    (inputChar, key) => {
      if (mode === "load" || mode === "list") {
        if (key.upArrow) {
          setSelectedIndex((prev) => Math.max(0, prev - 1));
        } else if (key.downArrow) {
          setSelectedIndex((prev) => Math.min(playlists.length - 1, prev + 1));
        } else if (key.return && mode === "load") {
          if (
            onLoad &&
            selectedIndex >= 0 &&
            selectedIndex < playlists.length
          ) {
            onLoad(playlists[selectedIndex]!);
          }
        } else if (inputChar === "d" && mode === "load") {
          if (
            onDelete &&
            selectedIndex >= 0 &&
            selectedIndex < playlists.length
          ) {
            onDelete(playlists[selectedIndex]!);
          }
        }
      }
    },
    { isActive: mode !== "save" },
  );

  const handleSubmit = () => {
    if (mode === "save" && onSave) {
      if (input.trim()) {
        onSave(input.trim());
        setInput("");
      }
    }
  };

  if (mode === "save") {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="yellow"
        padding={1}
      >
        <Text bold color="yellow">
          💾 Save Playlist
        </Text>
        <Box marginTop={1}>
          <Text>Enter playlist name: </Text>
          <TextInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
          />
        </Box>
        {error && (
          <Box marginTop={1}>
            <Text color="red">{error}</Text>
          </Box>
        )}
        <Box marginTop={1}>
          <Text dimColor>Press Enter to save • Esc to cancel</Text>
        </Box>
      </Box>
    );
  }

  if (mode === "list" || mode === "load") {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="cyan"
        padding={1}
      >
        <Text bold color="cyan">
          {mode === "load" ? "📂 Load Playlist" : "📋 Playlists"}
        </Text>
        {playlists.length === 0 ? (
          <Box marginTop={1}>
            <Text dimColor>No playlists saved yet</Text>
          </Box>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            {playlists.map((name, index) => (
              <Box key={name}>
                <Text color={index === selectedIndex ? "green" : undefined}>
                  {index === selectedIndex ? "▶ " : "  "}
                  {name}
                </Text>
              </Box>
            ))}
          </Box>
        )}
        {error && (
          <Box marginTop={1}>
            <Text color="red">{error}</Text>
          </Box>
        )}
        <Box marginTop={1}>
          <Text dimColor>
            {mode === "load"
              ? "↑↓ Navigate • Enter to load • d to delete • Esc to cancel"
              : "Press Esc to close"}
          </Text>
        </Box>
      </Box>
    );
  }

  return null;
};
