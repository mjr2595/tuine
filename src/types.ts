export type TrackStatus =
  | "pending"
  | "downloading"
  | "ready"
  | "playing"
  | "error";

export type PlaybackState =
  | "idle"
  | "buffering"
  | "playing"
  | "paused"
  | "finished";

export interface Track {
  url: string;
  videoId: string;
  title?: string;
  duration?: number;
  status: TrackStatus;
  filePath?: string;
  error?: string;
}

export interface DownloadProgress {
  videoId: string;
  percent: number;
  downloaded: string;
  total: string;
  speed: string;
  eta: string;
}

export interface VideoMetadata {
  id: string;
  title: string;
  duration: number;
  ext: string;
}

export interface PlaylistTrack {
  url: string;
  videoId: string;
  title: string;
  duration?: number;
}

export interface Playlist {
  name: string;
  tracks: PlaylistTrack[];
  createdAt: string;
  updatedAt: string;
}
