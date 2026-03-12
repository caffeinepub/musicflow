import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { BarChart2, Heart, Library, Music2, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { LyricsPanel } from "./components/LyricsPanel";
import { MiniPlayer } from "./components/MiniPlayer";
import { AudioPlayerProvider } from "./contexts/AudioPlayerContext";
import { useAudioPlayer } from "./contexts/AudioPlayerContext";
import { useSongs } from "./hooks/useQueries";
import { FavoritesView } from "./views/FavoritesView";
import { LibraryView } from "./views/LibraryView";
import { StatsView } from "./views/StatsView";
import { TopPlayedView } from "./views/TopPlayedView";

type Tab = "biblioteca" | "topplayed" | "favoritos" | "estadisticas";

const NAV_ITEMS: {
  id: Tab;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "biblioteca", label: "Biblioteca", Icon: Library },
  { id: "topplayed", label: "Más Reproducidas", Icon: TrendingUp },
  { id: "favoritos", label: "Favoritos", Icon: Heart },
  { id: "estadisticas", label: "Estadísticas", Icon: BarChart2 },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("biblioteca");
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const { currentSong, queue } = useAudioPlayer();
  const { data: allSongs = [] } = useSongs();

  const currentSongIndex = currentSong
    ? (queue.length > 0 ? queue : allSongs).findIndex(
        (s) => s.id === currentSong.id,
      )
    : 0;

  const views: Record<Tab, React.ReactNode> = {
    biblioteca: <LibraryView />,
    topplayed: <TopPlayedView />,
    favoritos: <FavoritesView />,
    estadisticas: <StatsView />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-card/50">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Music2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              MusicFlow
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.tab`}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left",
                activeTab === id
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="font-body">{label}</span>
              {activeTab === id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-muted-foreground text-xs leading-relaxed">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top nav */}
        <header className="md:hidden flex items-center gap-1 px-3 py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 mr-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Music2 className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base">MusicFlow</span>
          </div>
          {NAV_ITEMS.map(({ id, Icon }) => (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.tab`}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-all",
                activeTab === id ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto pb-24">
          {/* Page title */}
          <div className="px-4 pt-5 pb-2">
            <h1 className="font-display font-bold text-2xl">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {views[activeTab]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mini Player */}
      <MiniPlayer
        onLyricsToggle={() => setLyricsOpen(true)}
        songIndex={Math.max(0, currentSongIndex)}
      />

      {/* Lyrics Panel */}
      <LyricsPanel
        open={lyricsOpen}
        onClose={() => setLyricsOpen(false)}
        songIndex={Math.max(0, currentSongIndex)}
      />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AudioPlayerProvider>
      <AppContent />
    </AudioPlayerProvider>
  );
}
