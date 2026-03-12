import { Card, CardContent } from "@/components/ui/card";
import { Clock, Headphones, Music, TrendingUp } from "lucide-react";
import { CoverArt } from "../components/CoverArt";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import { useSongs, useTotalSecondsListened } from "../hooks/useQueries";

function formatListeningTime(totalSeconds: bigint): {
  hours: number;
  minutes: number;
} {
  const s = Number(totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  return { hours, minutes };
}

const WEEK_BARS = [
  { day: "L", h: 0.3 },
  { day: "M", h: 0.6 },
  { day: "X", h: 0.45 },
  { day: "J", h: 0.8 },
  { day: "V", h: 1 },
  { day: "S", h: 0.7 },
  { day: "D", h: 0.5 },
];

export function StatsView() {
  const { data: totalSeconds = BigInt(0) } = useTotalSecondsListened();
  const { data: allSongs = [] } = useSongs();
  const { queue } = useAudioPlayer();

  const { hours, minutes } = formatListeningTime(totalSeconds);

  // Display top 5 songs from queue or all songs
  const displaySongs = (queue.length > 0 ? queue : allSongs).slice(0, 5);

  const statCards = [
    {
      icon: Clock,
      label: "Tiempo escuchado",
      value: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      sub: "en total",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Music,
      label: "Canciones disponibles",
      value: allSongs.length.toString(),
      sub: "en tu biblioteca",
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      icon: Headphones,
      label: "Sesión actual",
      value: queue.length > 0 ? `${queue.length}` : "0",
      sub: "canciones en cola",
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      icon: TrendingUp,
      label: "Favoritas",
      value: "—",
      sub: "ve a Favoritos",
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
  ];

  return (
    <div data-ocid="stats.section" className="p-4 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className={`font-display font-bold text-2xl ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-foreground text-sm font-medium mt-0.5">
                  {stat.label}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Listening time breakdown */}
      <div>
        <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Actividad semanal
        </h3>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-end gap-1 h-16">
              {WEEK_BARS.map(({ day, h }) => (
                <div
                  key={day}
                  className="flex-1 rounded-t-sm bg-primary/20 hover:bg-primary/40 transition-colors"
                  style={{ height: `${h * 100}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {WEEK_BARS.map(({ day }) => (
                <span
                  key={day}
                  className="flex-1 text-center text-xs text-muted-foreground"
                >
                  {day}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top songs visual */}
      {displaySongs.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            En tu biblioteca
          </h3>
          <div className="space-y-2">
            {displaySongs.map((song, i) => (
              <div
                key={song.id.toString()}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
              >
                <span className="font-display font-bold text-lg text-muted-foreground/50 w-6 text-center">
                  {i + 1}
                </span>
                <CoverArt
                  coverUrl={song.coverUrl}
                  title={song.title}
                  size={36}
                  index={i}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-semibold truncate">
                    {song.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {song.artist}
                  </p>
                </div>
                <div
                  className="h-1 rounded-full bg-primary/40"
                  style={{ width: `${Math.max(20, (5 - i) * 16)}px` }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
