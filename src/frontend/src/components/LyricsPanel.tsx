import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import { useLyrics } from "../hooks/useQueries";
import { CoverArt } from "./CoverArt";

interface LyricsPanelProps {
  open: boolean;
  onClose: () => void;
  songIndex: number;
}

const DEMO_LYRICS = [
  { timeSeconds: 0, text: "" },
  { timeSeconds: 5, text: "Las noches de neón brillan en la ciudad" },
  { timeSeconds: 10, text: "Millones de luces que nunca se apagarán" },
  { timeSeconds: 15, text: "Caminando solo entre sombras y cristal" },
  { timeSeconds: 20, text: "Buscando algo real en este mundo digital" },
  { timeSeconds: 28, text: "El sonido del silencio me llama" },
  { timeSeconds: 33, text: "Y entre el ruido encuentro mi alma" },
  { timeSeconds: 38, text: "Frecuencias que vibran sin parar" },
  { timeSeconds: 43, text: "En la oscuridad quiero brillar" },
  { timeSeconds: 50, text: "Neon, neon, neon..." },
  { timeSeconds: 55, text: "Las luces me guían esta noche" },
  { timeSeconds: 62, text: "Ningún obstáculo que no me roche" },
  { timeSeconds: 68, text: "El ritmo del corazón es mi canción" },
  { timeSeconds: 75, text: "Y esta melodía es mi salvación" },
];

function getActiveIndex(
  lyrics: { timeSeconds: number; text: string }[],
  currentTime: number,
) {
  let idx = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].timeSeconds <= currentTime) {
      idx = i;
    } else {
      break;
    }
  }
  return idx;
}

export function LyricsPanel({ open, onClose, songIndex }: LyricsPanelProps) {
  const { currentSong, currentTime } = useAudioPlayer();
  const { data: lyrics = [] } = useLyrics(currentSong?.id ?? null);

  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const displayLyrics = lyrics.length > 0 ? lyrics : DEMO_LYRICS;
  const displayActiveIndex = getActiveIndex(displayLyrics, currentTime);

  // Auto-scroll to active line
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional – scroll when active line changes
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [displayActiveIndex]);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        data-ocid="lyrics.panel"
        side="right"
        className="w-full sm:w-[380px] bg-card border-l border-border flex flex-col p-0"
      >
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            {currentSong && (
              <CoverArt
                coverUrl={currentSong.coverUrl}
                title={currentSong.title}
                size={52}
                index={songIndex}
                isPlaying
              />
            )}
            <div>
              <SheetTitle className="font-display text-lg leading-tight">
                {currentSong?.title ?? "Sin canción"}
              </SheetTitle>
              <p className="text-muted-foreground text-sm mt-0.5">
                {currentSong?.artist ?? ""}
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-8 space-y-4">
            {!currentSong ? (
              <p className="text-muted-foreground text-center py-10 text-sm">
                Reproduce una canción para ver la letra
              </p>
            ) : (
              displayLyrics.map((line, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: lyric lines have no unique id
                  key={i}
                  ref={i === displayActiveIndex ? activeLineRef : null}
                  className={cn(
                    "text-lg leading-relaxed transition-all duration-300 cursor-default select-none",
                    i === displayActiveIndex
                      ? "text-foreground font-display font-bold text-xl scale-105 origin-left"
                      : i < displayActiveIndex
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground",
                  )}
                >
                  {line.text || "\u00A0"}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
