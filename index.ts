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
  // Check if --check flag is passed
  const shouldRunCheck = process.argv.includes("--check");

  if (shouldRunCheck) {
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
    process.exit(0);
  }

  // Silent check - just determine player type without verbose output
  const systemCheck = await checkSystemRequirements();
  const playerType = getAudioPlayer(systemCheck);
  
  if (!playerType || !systemCheck.ytdlp) {
    console.log("❌ Missing required dependencies. Run with --check flag for details.\n");
    process.exit(1);
  }

  // Initialize cache directory
  initCache();

  // Render the app
  render(<App playerType={playerType} />);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});