interface KpiCardProps {
  label: string;
  value: string | number;
  accentColor?: string;
  subLabel?: string;
  subValue?: string | number;
}

export default function KpiCard({ label, value, accentColor = '#e6a817', subLabel, subValue }: KpiCardProps) {
  return (
    <div
      className="bg-dark-card border border-dark-border rounded-md p-4"
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      <div className="text-[0.72rem] font-medium text-text-secondary uppercase tracking-widest mb-1.5">
        {label}
      </div>
      <div className="font-mono text-xl font-semibold leading-tight truncate" style={{ color: accentColor }}>
        {value}
      </div>
      {subLabel && (
        <div className="text-[0.72rem] text-text-secondary mt-1.5">
          {subLabel}: <span className="text-text-primary">{subValue}</span>
        </div>
      )}
    </div>
  );
}
