import { useStore } from '../store/useStore';
import SectionHeader from '../components/SectionHeader';
import { extractParams, computeIndicators } from '../utils/finance';
import { formatSmart, formatPercent, formatNumber } from '../utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts';

const PALETTE = ["#e6a817", "#58a6ff", "#3fb950", "#f85149"];
const tooltipStyle = { backgroundColor: '#161b22', borderColor: '#21262d', color: '#e6edf3' };

export default function ScenarioComparison() {
  const scenarios = useStore(state => state.scenarios);
  const names = Object.keys(scenarios);

  const results = names.map((name, i) => {
    const d = scenarios[name];
    const p = extractParams(d);
    const price = d["Main Product Price"] ?? 2000;
    const ind = computeIndicators(p, price);
    return { name, ind, p, color: PALETTE[i % PALETTE.length] };
  });

  const maxLen = Math.max(...results.map(r => r.ind.acpvs.length));
  const cfData = Array.from({ length: maxLen }, (_, i) => {
    const row: any = { year: i - (results[0]?.p.epc_yrs + 1 ?? 3) };
    results.forEach(r => {
      if (i < r.ind.acpvs.length) row[r.name] = r.ind.acpvs[i] / 1e6;
    });
    return row;
  });

  const kpiRows = [
    { label: "Total Investment (TIC)", fmt: (r: any) => formatSmart(r.ind.TIC) },
    { label: "NPV",                    fmt: (r: any) => formatSmart(r.ind.NPV) },
    { label: "IRR",                    fmt: (r: any) => r.ind.IRR !== null ? formatPercent(r.ind.IRR) : "—" },
    { label: "MSP ($/unit)",           fmt: (r: any) => r.ind.MSP !== null ? `$${r.ind.MSP.toFixed(2)}` : "—" },
    { label: "Payback (years)",        fmt: (r: any) => r.ind.Payback !== null ? `${r.ind.Payback}` : "—" },
    { label: "MARR",                   fmt: (r: any) => formatPercent(r.ind.MARR) },
    { label: "Total OPEX",             fmt: (r: any) => formatSmart(r.ind.OPEX) },
  ];

  const barData = [
    { metric: "TIC",  ...Object.fromEntries(results.map(r => [r.name, (r.ind.TIC ?? 0) / 1e6])) },
    { metric: "NPV",  ...Object.fromEntries(results.map(r => [r.name, (r.ind.NPV ?? 0) / 1e6])) },
    { metric: "OPEX", ...Object.fromEntries(results.map(r => [r.name, (r.ind.OPEX ?? 0) / 1e6])) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Scenario Comparison</h2>
        <p className="text-xs text-text-secondary mt-1 uppercase tracking-wider">Side-by-side financial KPIs and cash flow overlay</p>
      </div>

      <SectionHeader title="Financial KPI Comparison" />
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              <th className="py-3 px-4 text-xs text-text-secondary min-w-[180px]">Metric</th>
              {results.map(r => (
                <th key={r.name} className="py-3 px-4 text-xs font-bold text-right" style={{ color: r.color }}>{r.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/40">
            {kpiRows.map(row => (
              <tr key={row.label} className="hover:bg-dark-border/20">
                <td className="py-2.5 px-4 text-sm text-text-secondary">{row.label}</td>
                {results.map(r => (
                  <td key={r.name} className="py-2.5 px-4 text-sm font-mono text-right text-text-primary">
                    {row.fmt(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeader title="Cumulative Discounted Cash Flow" color="#58a6ff" />
      <div className="h-80 bg-dark-card border border-dark-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cfData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis dataKey="year" stroke="#8b949e" tick={{ fontSize: 11 }} />
            <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toFixed(0)}M`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toFixed(1)}M`, undefined]} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <ReferenceLine y={0} stroke="#484f58" strokeDasharray="4 4" />
            {results.map(r => (
              <Line key={r.name} type="monotone" dataKey={r.name} stroke={r.color} strokeWidth={2.5} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <SectionHeader title="Key Metrics Comparison" color="#3fb950" />
      <div className="h-64 bg-dark-card border border-dark-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="metric" stroke="#8b949e" tick={{ fontSize: 11 }} />
            <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toFixed(0)}M`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v.toFixed(1)}M`} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {results.map(r => (
              <Bar key={r.name} dataKey={r.name} fill={r.color} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
