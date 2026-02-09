import React from "react";
import { render } from "ink";
import { App } from "./src/components/App";
import {
  checkSystemRequirements,
  getInstallationInstructions,
  getAudioPlayer,
} from "./src/utils/system";
import { initCache } from "./src/services/cache";

async function main() {
  console.log("🎵 Checking system requirements...\n");

  const systemCheck = await checkSystemRequirements();
  const instructions = getInstallationInstructions(systemCheck);

  if (instructions.length > 0) {
    console.log("System requirements not met:\n");
    instructions.forEach((instruction) => console.log(instruction));
    console.log("\nPlease install missing dependencies and try again.\n");
    process.exit(1);
  }

  const playerType = getAudioPlayer(systemCheck);
  if (!playerType) {
    console.log("❌ No audio player found");
    process.exit(1);
  }

  console.log("✅ All requirements met!");
  console.log(`   Using audio player: ${playerType}`);
  console.log(`   yt-dlp: ${systemCheck.ytdlp ? "✓" : "✗"}`);
  console.log(`   ffmpeg: ${systemCheck.ffmpeg ? "✓" : "✗"}\n`);

  // Initialize cache directory
  initCache();

  // Render the app
  render(<App playerType={playerType} />);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});