export function ReliabilityBadge({ score }: { score: number }) {
  const label = score >= 3 ? "High" : score === 2 ? "Corroborated" : "Single-source";
  const color = score >= 3 ? "text-accent-strong" : score === 2 ? "text-gold" : "text-muted";
  return (
    <span className={`font-mono text-[10px] uppercase tracking-widest ${color}`}>
      ● {label} ({score} src{score === 1 ? "" : "s"})
    </span>
  );
}
