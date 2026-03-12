import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Song } from "../backend";
import { useActor } from "../hooks/useActor";

interface AudioPlayerContextValue {
  queue: Song[];
  setQueue: (songs: Song[], startIndex?: number) => void;
  currentSong: Song | null;
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  playNext: () => void;
  playPrev: () => void;
  playSong: (song: Song, songList?: Song[]) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({
  children,
}: { children: React.ReactNode }) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [queue, setQueueState] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsListenedRef = useRef(0);
  const isSimulatingRef = useRef(false);
  const hasRecordedRef = useRef(false);
  const currentSongIdRef = useRef<bigint | null>(null);
  // Use refs to avoid stale closures in simulation interval
  const queueRef = useRef(queue);
  const actorRef = useRef(actor);
  const queryClientRef = useRef(queryClient);
  queueRef.current = queue;
  actorRef.current = actor;
  queryClientRef.current = queryClient;

  const currentSong =
    currentIndex >= 0 && currentIndex < queue.length
      ? queue[currentIndex]
      : null;

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
  }, []);

  const cleanupAudio = useCallback(() => {
    stopSimulation();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, [stopSimulation]);

  const recordPlay = useCallback(async (songId: bigint, secs: number) => {
    if (!actorRef.current || secs < 5) return;
    try {
      await actorRef.current.recordPlay(songId, BigInt(Math.floor(secs)));
      queryClientRef.current.invalidateQueries({
        queryKey: ["playCount", songId.toString()],
      });
      queryClientRef.current.invalidateQueries({ queryKey: ["topPlayed"] });
      queryClientRef.current.invalidateQueries({ queryKey: ["totalSeconds"] });
      queryClientRef.current.invalidateQueries({ queryKey: ["songs"] });
    } catch {
      // ignore
    }
  }, []);

  // When current song changes (by index or queue), initialize audio
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional – reinitialize only when song changes by index
  useEffect(() => {
    cleanupAudio();
    hasRecordedRef.current = false;
    secondsListenedRef.current = 0;

    const song =
      currentIndex >= 0 && currentIndex < queueRef.current.length
        ? queueRef.current[currentIndex]
        : null;

    if (!song) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      return;
    }

    currentSongIdRef.current = song.id;
    const dur = Number(song.duration);
    setDuration(dur);
    setCurrentTime(0);

    if (song.audioUrl && song.audioUrl.length > 0) {
      isSimulatingRef.current = false;
      const audio = new Audio(song.audioUrl);
      audio.volume = volume;
      audioRef.current = audio;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
        secondsListenedRef.current = audio.currentTime;
      });
      audio.addEventListener("ended", () => {
        if (!hasRecordedRef.current && currentSongIdRef.current !== null) {
          hasRecordedRef.current = true;
          recordPlay(currentSongIdRef.current, secondsListenedRef.current);
        }
        setIsPlaying(false);
        setCurrentIndex((idx) => {
          const next = idx + 1;
          return next < queueRef.current.length ? next : idx;
        });
      });

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      // Simulate playback
      isSimulatingRef.current = true;
      setIsPlaying(true);
      simulationRef.current = setInterval(() => {
        setCurrentTime((t) => {
          const next = t + 1;
          secondsListenedRef.current += 1;

          if (!hasRecordedRef.current && secondsListenedRef.current >= 30) {
            hasRecordedRef.current = true;
            if (currentSongIdRef.current !== null) {
              recordPlay(currentSongIdRef.current, secondsListenedRef.current);
            }
          }

          if (next >= dur) {
            stopSimulation();
            if (!hasRecordedRef.current && currentSongIdRef.current !== null) {
              hasRecordedRef.current = true;
              recordPlay(currentSongIdRef.current, secondsListenedRef.current);
            }
            setIsPlaying(false);
            setCurrentIndex((idx) => {
              const nextIdx = idx + 1;
              return nextIdx < queueRef.current.length ? nextIdx : idx;
            });
            return dur;
          }
          return next;
        });
      }, 1000);
    }

    return cleanupAudio;
  }, [currentIndex, cleanupAudio, recordPlay, stopSimulation, volume]);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = useCallback(() => {
    if (audioRef.current && !isSimulatingRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else if (isSimulatingRef.current) {
      setIsPlaying(true);
      // Resume simulation
      const dur = duration;
      simulationRef.current = setInterval(() => {
        setCurrentTime((t) => {
          const next = t + 1;
          secondsListenedRef.current += 1;
          if (!hasRecordedRef.current && secondsListenedRef.current >= 30) {
            hasRecordedRef.current = true;
            if (currentSongIdRef.current !== null) {
              recordPlay(currentSongIdRef.current, secondsListenedRef.current);
            }
          }
          if (next >= dur) {
            stopSimulation();
            setIsPlaying(false);
            return dur;
          }
          return next;
        });
      }, 1000);
    }
  }, [duration, recordPlay, stopSimulation]);

  const pause = useCallback(() => {
    if (audioRef.current && !isSimulatingRef.current) {
      audioRef.current.pause();
    }
    stopSimulation();
    setIsPlaying(false);
  }, [stopSimulation]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const seekTo = useCallback((seconds: number) => {
    if (audioRef.current && !isSimulatingRef.current) {
      audioRef.current.currentTime = seconds;
    }
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
  }, []);

  const setQueue = useCallback((songs: Song[], startIndex = 0) => {
    setQueueState(songs);
    setCurrentIndex(startIndex);
  }, []);

  const playNext = useCallback(() => {
    setCurrentIndex((idx) =>
      idx + 1 < queueRef.current.length ? idx + 1 : idx,
    );
  }, []);

  const playPrev = useCallback(() => {
    setCurrentIndex((prevIdx) => {
      // If more than 3s in, restart; else go to previous
      return prevIdx - 1 >= 0 ? prevIdx - 1 : prevIdx;
    });
  }, []);

  const playSong = useCallback((song: Song, songList?: Song[]) => {
    const list = songList ?? queueRef.current;
    const idx = list.findIndex((s) => s.id === song.id);
    if (idx === -1) {
      setQueueState([song]);
      setCurrentIndex(0);
    } else {
      if (songList) setQueueState(songList);
      setCurrentIndex(idx);
    }
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        queue,
        setQueue,
        currentSong,
        currentIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        play,
        pause,
        togglePlay,
        seekTo,
        setVolume,
        playNext,
        playPrev,
        playSong,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx)
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
}
