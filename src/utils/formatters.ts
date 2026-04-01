export function formatSmart(value: number | null | undefined, unit = "USD"): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const absVal = Math.abs(value);
  if (absVal >= 1_000_000) return `${(value / 1_000_000).toFixed(3)} MM${unit}`;
  if (absVal >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(2)}`;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const absVal = Math.abs(value);
  if (absVal >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (absVal >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
