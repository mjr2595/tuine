import React from "react";
import { Box, Text } from "ink";

export const Controls: React.FC = () => {
  return (
    <Box
      flexDirection="column"
      paddingY={1}
      borderStyle="round"
      borderColor="magenta"
    >
      <Box paddingX={2}>
        <Text bold color="magenta">
          Controls
        </Text>
      </Box>

      <Box flexDirection="column" paddingX={2} marginTop={1}>
        <Text dimColor>
          <Text bold>Space</Text> - Play/Pause (stop current track)
        </Text>
        <Text dimColor>
          <Text bold>n</Text> - Next track
        </Text>
        <Text dimColor>
          <Text bold>p</Text> - Previous track
        </Text>
        <Text dimColor>
          <Text bold>c</Text> - Clear queue
        </Text>
        <Text dimColor>
          <Text bold>q</Text> - Quit
        </Text>
      </Box>
    </Box>
  );
};
