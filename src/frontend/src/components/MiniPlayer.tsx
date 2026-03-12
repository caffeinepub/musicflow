import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Heart,
  Mic2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import { useFavorites, useToggleFavorite } from "../hooks/useQueries";
import { CoverArt } from "./CoverArt";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface MiniPlayerProps {
  onLyricsToggle: () => void;
  songIndex: number;
}

export function MiniPlayer({ onLyricsToggle, songIndex }: MiniPlayerProps) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    seekTo,
    setVolume,
    playNext,
    playPrev,
  } = useAudioPlayer();

  const { data: favorites = [] } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const isFav = currentSong
    ? favorites.some((id) => id === currentSong.id)
    : false;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-20 border-t border-border bg-card/95 backdrop-blur-xl flex items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Selecciona una canción para reproducir
        </p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl">
      {/* Progress bar */}
      <div className="relative h-1 bg-border">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
        <input
          data-ocid="player.progress.input"
          type="range"
          min={0}
          max={duration || 100}
          step={1}
          value={currentTime}
          onChange={(e) => seekTo(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-1"
          aria-label="Progreso de la canción"
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-2 h-[72px]">
        {/* Song info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <CoverArt
            coverUrl={currentSong.coverUrl}
            title={currentSong.title}
            size={44}
            index={songIndex}
            isPlaying={isPlaying}
          />
          <div className="min-w-0">
            <p className="font-display font-semibold text-sm text-foreground truncate leading-tight">
              {currentSong.title}
            </p>
            <p className="text-muted-foreground text-xs truncate">
              {currentSong.artist}
            </p>
          </div>
          <Button
            data-ocid="player.favorite.toggle"
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={() => toggleFavorite.mutate(currentSong.id)}
            aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <Heart
              className={cn("h-4 w-4", isFav && "fill-primary text-primary")}
            />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            data-ocid="player.prev_button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={playPrev}
            aria-label="Anterior"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            data-ocid="player.play_button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            data-ocid="player.next_button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={playNext}
            aria-label="Siguiente"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Right side: time + volume + lyrics */}
        <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
          <span className="text-muted-foreground text-xs tabular-nums hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              aria-label="Silenciar"
            >
              {volume === 0 ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </Button>
            <input
              data-ocid="player.volume.input"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20"
              aria-label="Volumen"
            />
          </div>
          <Button
            data-ocid="lyrics.toggle.button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onLyricsToggle}
            aria-label="Ver letra"
          >
            <Mic2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
