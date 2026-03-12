import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Music, Pause, Play } from "lucide-react";
import type { Song } from "../backend";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import {
  useFavorites,
  usePlayCount,
  useToggleFavorite,
} from "../hooks/useQueries";
import { CoverArt } from "./CoverArt";

function formatDuration(seconds: bigint) {
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface SongRowProps {
  song: Song;
  index: number;
  songList: Song[];
  showPosition?: boolean;
  ocidIndex: number;
}

export function SongRow({
  song,
  index,
  songList,
  showPosition = false,
  ocidIndex,
}: SongRowProps) {
  const { currentSong, isPlaying, playSong, pause, play } = useAudioPlayer();
  const { data: favorites = [] } = useFavorites();
  const { data: playCount = BigInt(0) } = usePlayCount(song.id);
  const toggleFavorite = useToggleFavorite();

  const isCurrentSong = currentSong?.id === song.id;
  const isFav = favorites.some((id) => id === song.id);

  const handleClick = () => {
    if (isCurrentSong) {
      if (isPlaying) pause();
      else play();
    } else {
      playSong(song, songList);
    }
  };

  return (
    <div
      data-ocid={`song.item.${ocidIndex}`}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
        isCurrentSong
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted/50 border border-transparent",
      )}
    >
      {/* Clickable main area */}
      <button
        type="button"
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        onClick={handleClick}
        aria-label={`Reproducir ${song.title} por ${song.artist}`}
      >
        {/* Position or play indicator */}
        <div className="w-7 text-center shrink-0">
          {showPosition ? (
            <span
              className={cn(
                "font-display font-bold text-sm",
                isCurrentSong ? "text-primary" : "text-muted-foreground",
              )}
            >
              {index + 1}
            </span>
          ) : (
            <div className="flex items-center justify-center">
              {isCurrentSong && isPlaying ? (
                <div className="flex gap-0.5 items-end h-3">
                  <span
                    className="w-0.5 bg-primary rounded-full animate-bounce"
                    style={{ height: "8px", animationDelay: "0ms" }}
                  />
                  <span
                    className="w-0.5 bg-primary rounded-full animate-bounce"
                    style={{ height: "12px", animationDelay: "150ms" }}
                  />
                  <span
                    className="w-0.5 bg-primary rounded-full animate-bounce"
                    style={{ height: "6px", animationDelay: "300ms" }}
                  />
                </div>
              ) : (
                <span className="text-xs text-muted-foreground group-hover:hidden">
                  {index + 1}
                </span>
              )}
              {!isCurrentSong && (
                <Play className="h-3.5 w-3.5 text-muted-foreground hidden group-hover:block" />
              )}
              {isCurrentSong && !isPlaying && (
                <Pause className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
          )}
        </div>

        {/* Cover */}
        <CoverArt
          coverUrl={song.coverUrl}
          title={song.title}
          size={40}
          index={index}
          isPlaying={isCurrentSong && isPlaying}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-display font-semibold text-sm truncate leading-tight",
              isCurrentSong ? "text-primary" : "text-foreground",
            )}
          >
            {song.title}
          </p>
          <p className="text-muted-foreground text-xs truncate mt-0.5">
            {song.artist}
          </p>
        </div>
      </button>

      {/* Play count badge */}
      {Number(playCount) > 0 && (
        <Badge
          variant="secondary"
          className="shrink-0 text-xs gap-1 hidden sm:flex"
        >
          <Music className="h-2.5 w-2.5" />
          {Number(playCount)}
        </Badge>
      )}

      {/* Duration */}
      <span className="text-muted-foreground text-xs tabular-nums shrink-0 hidden sm:block">
        {formatDuration(song.duration)}
      </span>

      {/* Favorite */}
      <Button
        data-ocid={`song.favorite.toggle.${ocidIndex}`}
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7 shrink-0",
          isFav
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        )}
        onClick={() => toggleFavorite.mutate(song.id)}
        aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        <Heart
          className={cn("h-3.5 w-3.5", isFav && "fill-primary text-primary")}
        />
      </Button>
    </div>
  );
}
