interface CoverArtProps {
  coverUrl: string;
  title: string;
  size?: number;
  index?: number;
  className?: string;
  isPlaying?: boolean;
}

const GRADIENT_PAIRS = [
  ["#1a0533", "#7c3aed", "#c026d3"],
  ["#0c1a2e", "#0ea5e9", "#06b6d4"],
  ["#1a0a0a", "#dc2626", "#ea580c"],
  ["#0a1a0a", "#16a34a", "#84cc16"],
  ["#1a1200", "#d97706", "#f59e0b"],
  ["#0a0a1a", "#4f46e5", "#7c3aed"],
  ["#1a000a", "#db2777", "#e11d48"],
  ["#001a18", "#0d9488", "#059669"],
];

export function CoverArt({
  coverUrl,
  title,
  size = 48,
  index = 0,
  className = "",
  isPlaying = false,
}: CoverArtProps) {
  const grad = GRADIENT_PAIRS[index % GRADIENT_PAIRS.length];
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const sizeStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
  };

  return (
    <div
      className={`relative rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      style={sizeStyle}
    >
      {isPlaying && (
        <div
          className="absolute inset-0 rounded-lg pulse-ring"
          style={{
            boxShadow: `0 0 0 2px ${grad[2]}88, 0 0 16px ${grad[2]}44`,
          }}
        />
      )}
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover"
          style={sizeStyle}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white font-display font-bold"
          style={{
            background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]}, ${grad[2]})`,
            fontSize: Math.max(size * 0.28, 10),
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
