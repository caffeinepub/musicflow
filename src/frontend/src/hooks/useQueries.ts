import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LyricLine, Song } from "../backend";
import { useActor } from "./useActor";

export function useSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs"],
    queryFn: async () => {
      if (!actor) return SAMPLE_SONGS;
      try {
        const songs = await actor.getSongs();
        return songs.length > 0 ? songs : SAMPLE_SONGS;
      } catch {
        return SAMPLE_SONGS;
      }
    },
    enabled: !isFetching,
    staleTime: 30_000,
  });
}

export function useTopPlayed() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["topPlayed"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getTopPlayed();
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
    staleTime: 10_000,
  });
}

export function useFavorites() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getFavorites();
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
    staleTime: 5_000,
  });
}

export function usePlayCount(songId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["playCount", songId.toString()],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getPlayCount(songId);
      } catch {
        return BigInt(0);
      }
    },
    enabled: !isFetching,
    staleTime: 10_000,
  });
}

export function useTotalSecondsListened() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalSeconds"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await actor.getTotalSecondsListened();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !isFetching,
    staleTime: 10_000,
  });
}

export function useLyrics(songId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<LyricLine[]>({
    queryKey: ["lyrics", songId?.toString()],
    queryFn: async () => {
      if (!actor || songId === null) return [];
      try {
        return await actor.getLyrics(songId);
      } catch {
        return [];
      }
    },
    enabled: !isFetching && songId !== null,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useToggleFavorite() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (songId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.toggleFavorite(songId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

const SAMPLE_SONGS: Song[] = [
  {
    id: BigInt(1),
    title: "Neon Nights",
    artist: "Luna Eclipse",
    duration: BigInt(214),
    audioUrl: "",
    coverUrl: "",
  },
  {
    id: BigInt(2),
    title: "Deeper Than the Ocean",
    artist: "The Wave Collective",
    duration: BigInt(187),
    audioUrl: "",
    coverUrl: "",
  },
  {
    id: BigInt(3),
    title: "Midnight Frequencies",
    artist: "Static Dreams",
    duration: BigInt(253),
    audioUrl: "",
    coverUrl: "",
  },
  {
    id: BigInt(4),
    title: "Gravity's Pull",
    artist: "Orbital Sound",
    duration: BigInt(198),
    audioUrl: "",
    coverUrl: "",
  },
  {
    id: BigInt(5),
    title: "Cascada de Luz",
    artist: "Río Digital",
    duration: BigInt(231),
    audioUrl: "",
    coverUrl: "",
  },
  {
    id: BigInt(6),
    title: "Electric Soul",
    artist: "Void Surfers",
    duration: BigInt(176),
    audioUrl: "",
    coverUrl: "",
  },
  {
    id: BigInt(7),
    title: "Phantom Signal",
    artist: "Frequency Zero",
    duration: BigInt(265),
    audioUrl: "",
    coverUrl: "",
  },
  {
    id: BigInt(8),
    title: "Aurora Borealis",
    artist: "Northern Lights",
    duration: BigInt(242),
    audioUrl: "",
    coverUrl: "",
  },
];

export { SAMPLE_SONGS };
