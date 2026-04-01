export default function ScenarioBadge({ name, data, color }: { name: string; data: any; color: string }) {
  return (
    <div
      className="bg-dark-card border border-dark-border rounded-lg p-4"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="font-bold mb-1" style={{ color }}>{name}</div>
      <div className="text-sm mb-1 text-text-primary">{data["Product Name"] || "—"}</div>
      <div className="font-mono text-xs text-text-secondary mb-3">{data["Capacity Label"] || "—"}</div>
      <div className="flex flex-wrap gap-1.5">
        <span
          className="font-mono text-[0.68rem] px-2 py-0.5 rounded border"
          style={{ backgroundColor: `${color}22`, color, borderColor: `${color}44` }}
        >
          {data["TRL"] || "—"}
        </span>
        <span className="font-mono text-[0.68rem] px-2 py-0.5 rounded bg-dark-border text-text-secondary">
          {data["Process Severity"] || "—"}
        </span>
        <span className="font-mono text-[0.68rem] px-2 py-0.5 rounded bg-dark-border text-text-secondary">
          {data["Material Handled"] || "—"}
        </span>
      </div>
    </div>
  );
}
