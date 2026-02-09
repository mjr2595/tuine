import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";

interface UrlInputProps {
  onSubmit: (url: string) => void | Promise<void>;
  error?: string;
  disabled?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  onSubmit,
  error,
  disabled = false,
}) => {
  const [value, setValue] = useState("");

  const handleSubmit = (url: string) => {
    if (url.trim()) {
      onSubmit(url.trim());
      setValue("");
    }
  };

  return (
    <Box
      flexDirection="column"
      paddingY={1}
      borderStyle="round"
      borderColor="yellow"
    >
      <Box paddingX={2}>
        <Text bold color="yellow">
          Add YouTube URL
        </Text>
      </Box>

      <Box paddingX={2} marginTop={1}>
        <Text>URL: </Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </Box>

      {error && (
        <Box paddingX={2} marginTop={1}>
          <Text color="red">❌ {error}</Text>
        </Box>
      )}
    </Box>
  );
};
