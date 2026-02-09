import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useApp } from "ink";
import { NowPlaying } from "./NowPlaying";
import { QueueList } from "./QueueList";
import { Controls } from "./Controls";
import { UrlInput } from "./UrlInput";
import { PlaylistManager } from "./PlaylistManager";
import type { Track, PlaybackState } from "../types";
import { QueueManager } from "../services/queue";
import { Player, type PlayerType } from "../services/player";
import { Downloader } from "../services/downloader";
import { PlaylistManager as PlaylistService } from "../services/playlist";
import { isCached, getCachedPath } from "../services/cache";
import { fetchMetadata } from "../services/metadata";

interface AppProps {
  playerType: PlayerType;
}

export const App: React.FC<AppProps> = ({ playerType }) => {
  const { exit } = useApp();
  const [queue] = useState(() => new QueueManager());
  const [player] = useState(() => new Player({ playerType }));
  const [downloader] = useState(() => new Downloader());
  const [playlistService] = useState(() => new PlaylistService());

  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [inputError, setInputError] = useState<string>("");
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [showControls, setShowControls] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPlaylistSave, setShowPlaylistSave] = useState(false);
  const [showPlaylistLoad, setShowPlaylistLoad] = useState(false);
  const [playlists, setPlaylists] = useState<string[]>([]);
  const [playlistError, setPlaylistError] = useState<string>("");
  const [shuffleEnabled, setShuffleEnabled] = useState(false);

  // Update tracks whenever queue changes
  const refreshQueue = () => {
    setTracks(queue.getAll());
    setCurrentIndex(queue.getCurrentIndex());
    setCurrentTrack(queue.getCurrent());
  };

  const playNext = async () => {
    const current = queue.getCurrent();
    if (!current) return;

    // Check if file is ready or cached
    if (current.status === "ready" && current.filePath) {
      queue.updateTrack(current.videoId, { status: "playing" });
      refreshQueue();
      setPlaybackProgress(0);

      try {
        await player.play(
          current.filePath,
          () => {
            // Auto-advance to next track when finished
            if (queue.hasNext()) {
              queue.next();
              refreshQueue();
              setPlaybackProgress(0);
              playNext();
            } else {
              setPlaybackState("idle");
            }
          },
          (seconds) => {
            // Update playback progress
            setPlaybackProgress(seconds);
          },
        );
        setPlaybackState("playing");
      } catch (error) {
        queue.updateTrack(current.videoId, {
          status: "error",
          error: error instanceof Error ? error.message : "Playback error",
        });
        refreshQueue();
      }
    } else if (current.status === "pending") {
      // Need to download first
      const cachedPath = getCachedPath(current.videoId);

      if (cachedPath) {
        // File is already cached
        queue.updateTrack(current.videoId, {
          status: "ready",
          filePath: cachedPath,
        });
        refreshQueue();
        playNext();
      } else {
        // Start download
        queue.updateTrack(current.videoId, { status: "downloading" });
        refreshQueue();

        downloader.download(current.url, current.videoId, (event) => {
          switch (event.type) {
            case "metadata":
              if (event.metadata) {
                queue.updateTrack(current.videoId, {
                  title: event.metadata.title,
                  duration: event.metadata.duration,
                });
                refreshQueue();
              }
              break;

            case "progress":
              if (event.progress) {
                setDownloadProgress(event.progress.percent);
              }
              break;

            case "complete":
              if (event.filePath) {
                queue.updateTrack(current.videoId, {
                  status: "ready",
                  filePath: event.filePath,
                });
                refreshQueue();
                playNext();
              }
              break;

            case "error":
              queue.updateTrack(current.videoId, {
                status: "error",
                error: event.error,
              });
              refreshQueue();
              // Try next track
              if (queue.hasNext()) {
                queue.next();
                refreshQueue();
                playNext();
              }
              break;
          }
        });
      }
    }
  };

  const handleUrlSubmit = async (url: string) => {
    setInputError("");
    const result = queue.add(url);

    if (!result.success) {
      setInputError(result.error || "Failed to add URL");
      return;
    }

    refreshQueue();

    // Fetch metadata immediately to show title
    if (result.videoId) {
      const metadata = await fetchMetadata(url);
      if (metadata) {
        queue.updateTrack(result.videoId, {
          title: metadata.title,
          duration: metadata.duration,
        });
        refreshQueue();
      }
    }

    // If this is the first track or nothing is playing, start playback
    if (tracks.length === 0 || playbackState === "idle") {
      playNext();
    }
  };

  const handleNext = () => {
    player.stop();
    if (queue.hasNext()) {
      queue.next();
      refreshQueue();
      setDownloadProgress(0);
      setPlaybackProgress(0);
      playNext();
    }
  };

  const handlePrevious = () => {
    player.stop();
    if (queue.hasPrevious()) {
      queue.previous();
      refreshQueue();
      setDownloadProgress(0);
      setPlaybackProgress(0);
      playNext();
    }
  };

  const handlePlayPause = () => {
    if (player.isPlaying()) {
      player.stop();
      setPlaybackState("idle");
    } else {
      playNext();
    }
  };

  const handleClear = () => {
    player.stop();
    queue.clear();
    refreshQueue();
    setPlaybackState("idle");
    setDownloadProgress(0);
    setPlaybackProgress(0);
  };

  const loadPlaylists = async () => {
    const result = await playlistService.list();
    if (result.success && result.playlists) {
      setPlaylists(result.playlists);
    }
  };

  const handleSavePlaylist = async (name: string) => {
    setPlaylistError("");
    const result = await playlistService.save(name, tracks);
    if (result.success) {
      setShowPlaylistSave(false);
      await loadPlaylists();
    } else {
      setPlaylistError(result.error || "Failed to save playlist");
    }
  };

  const handleLoadPlaylist = async (name: string) => {
    setPlaylistError("");
    const result = await playlistService.load(name);
    if (result.success && result.playlist) {
      // Clear current queue
      player.stop();
      queue.clear();

      // Add all tracks from playlist
      for (const track of result.playlist.tracks) {
        const addResult = queue.add(track.url);
        if (addResult.success && addResult.videoId) {
          queue.updateTrack(addResult.videoId, {
            title: track.title,
            duration: track.duration,
          });
        }
      }

      refreshQueue();
      setShowPlaylistLoad(false);

      // Start playing if we added tracks
      if (result.playlist.tracks.length > 0) {
        playNext();
      }
    } else {
      setPlaylistError(result.error || "Failed to load playlist");
    }
  };

  const handleDeletePlaylist = async (name: string) => {
    const result = await playlistService.delete(name);
    if (result.success) {
      await loadPlaylists();
    } else {
      setPlaylistError(result.error || "Failed to delete playlist");
    }
  };

  const handleToggleShuffle = () => {
    const newShuffleState = queue.toggleShuffle();
    setShuffleEnabled(newShuffleState);
  };

  // Load playlists on mount
  useEffect(() => {
    loadPlaylists();
  }, []);

  useInput((input, key) => {
    // Close modals on Escape
    if (key.escape) {
      setShowControls(false);
      setShowUrlInput(false);
      setShowPlaylistSave(false);
      setShowPlaylistLoad(false);
      setPlaylistError("");
      return;
    }

    // Don't handle other keys if a modal is open
    if (showUrlInput || showPlaylistSave || showPlaylistLoad) {
      return;
    }

    if (input === "q") {
      player.stop();
      exit();
    } else if (input === " ") {
      handlePlayPause();
    } else if (input === "n") {
      handleNext();
    } else if (input === "p") {
      handlePrevious();
    } else if (input === "c") {
      handleClear();
    } else if (input === "h" || input === "?") {
      setShowControls(!showControls);
    } else if (input === "u") {
      setShowUrlInput(!showUrlInput);
    } else if (input === "s") {
      setShowPlaylistSave(true);
      setPlaylistError("");
    } else if (input === "l") {
      loadPlaylists();
      setShowPlaylistLoad(true);
      setPlaylistError("");
    } else if (input === "r") {
      handleToggleShuffle();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1} flexDirection="column">
        <Text bold color="cyan">
          ♪ TUINE - YouTube Audio Player{" "}
          {shuffleEnabled && <Text color="magenta">[SHUFFLE]</Text>}
        </Text>
        <Text dimColor>
          Press{" "}
          <Text bold color="yellow">
            h
          </Text>{" "}
          for help •{" "}
          <Text bold color="yellow">
            u
          </Text>{" "}
          to add URL •{" "}
          <Text bold color="yellow">
            s
          </Text>{" "}
          save playlist •{" "}
          <Text bold color="yellow">
            l
          </Text>{" "}
          load •{" "}
          <Text bold color="yellow">
            r
          </Text>{" "}
          shuffle •{" "}
          <Text bold color="yellow">
            q
          </Text>{" "}
          quit
        </Text>
      </Box>

      <NowPlaying
        track={currentTrack}
        progress={
          currentTrack?.status === "downloading"
            ? downloadProgress
            : currentTrack?.status === "playing"
              ? playbackProgress
              : 0
        }
      />

      <QueueList tracks={tracks} currentIndex={currentIndex} />

      {showControls && <Controls />}

      {showUrlInput && (
        <UrlInput onSubmit={handleUrlSubmit} error={inputError} />
      )}

      {showPlaylistSave && (
        <PlaylistManager
          mode="save"
          playlists={playlists}
          onSave={handleSavePlaylist}
          error={playlistError}
        />
      )}

      {showPlaylistLoad && (
        <PlaylistManager
          mode="load"
          playlists={playlists}
          onLoad={handleLoadPlaylist}
          onDelete={handleDeletePlaylist}
          error={playlistError}
        />
      )}
    </Box>
  );
};
