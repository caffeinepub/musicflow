import { Skeleton } from "@/components/ui/skeleton";
import { Music } from "lucide-react";
import { SongRow } from "../components/SongRow";
import { useSongs } from "../hooks/useQueries";

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

export function LibraryView() {
  const { data: songs = [], isLoading } = useSongs();

  if (isLoading) {
    return (
      <div data-ocid="library.loading_state" className="space-y-2 p-4">
        {SKELETON_KEYS.map((k) => (
          <div key={k} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
            <Skeleton className="h-3 w-8 rounded hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (!songs.length) {
    return (
      <div
        data-ocid="library.empty_state"
        className="flex flex-col items-center justify-center py-20 gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <Music className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-foreground">
            Biblioteca vacía
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            No hay canciones disponibles aún
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground text-sm">
          {songs.length} canciones
        </p>
      </div>
      {songs.map((song, i) => (
        <SongRow
          key={song.id.toString()}
          song={song}
          index={i}
          songList={songs}
          ocidIndex={i + 1}
        />
      ))}
    </div>
  );
}
