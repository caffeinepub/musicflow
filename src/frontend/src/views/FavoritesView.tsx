import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import { SongRow } from "../components/SongRow";
import { useFavorites, useSongs } from "../hooks/useQueries";

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4"];

export function FavoritesView() {
  const { data: favoriteIds = [], isLoading: isLoadingFavs } = useFavorites();
  const { data: allSongs = [], isLoading: isLoadingSongs } = useSongs();

  const isLoading = isLoadingFavs || isLoadingSongs;

  const favoriteSongs = allSongs.filter((s) =>
    favoriteIds.some((id) => id === s.id),
  );

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {SKELETON_KEYS.map((k) => (
          <div key={k} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-4 w-4 rounded" />
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

  if (!favoriteSongs.length) {
    return (
      <div
        data-ocid="favorites.empty_state"
        className="flex flex-col items-center justify-center py-20 gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-foreground">
            Sin favoritos
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Pulsa el corazón en cualquier canción para añadirla
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-muted-foreground text-sm">
          {favoriteSongs.length} favorita{favoriteSongs.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="space-y-1">
        {favoriteSongs.map((song, i) => (
          <SongRow
            key={song.id.toString()}
            song={song}
            index={i}
            songList={favoriteSongs}
            ocidIndex={i + 1}
          />
        ))}
      </div>
    </div>
  );
}
