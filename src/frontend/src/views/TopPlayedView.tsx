import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { SongRow } from "../components/SongRow";
import { useSongs, useTopPlayed } from "../hooks/useQueries";

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5"];

export function TopPlayedView() {
  const { data: topPlayed = [], isLoading: isLoadingTop } = useTopPlayed();
  const { data: allSongs = [] } = useSongs();

  // If top played from backend is empty, show all songs as placeholder
  const displaySongs = topPlayed.length > 0 ? topPlayed : allSongs.slice(0, 10);
  const isLoading = isLoadingTop;

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {SKELETON_KEYS.map((k) => (
          <div key={k} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!displaySongs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-foreground">
            Sin datos todavía
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Reproduce canciones para ver las más escuchadas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-muted-foreground text-sm">
          Top {displaySongs.length} más reproducidas
        </p>
      </div>
      <div className="space-y-1">
        {displaySongs.map((song, i) => (
          <SongRow
            key={song.id.toString()}
            song={song}
            index={i}
            songList={displaySongs}
            showPosition
            ocidIndex={i + 1}
          />
        ))}
      </div>
    </div>
  );
}
