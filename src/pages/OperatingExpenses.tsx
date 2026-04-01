import { useStore } from '../store/useStore';
import SectionHeader from '../components/SectionHeader';
import KpiCard from '../components/KpiCard';
import { formatSmart } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PALETTE = ["#e6a817", "#58a6ff", "#3fb950", "#f85149"];
const tooltipStyle = { backgroundColor: '#161b22', borderColor: '#21262d', color: '#e6edf3' };

export default function OperatingExpenses() {
  const scenarios = useStore(state => state.scenarios);
  const names = Object.keys(scenarios);

  const opexData = names.map(name => {
    const d = scenarios[name];
    return {
      name,
      "Raw Materials":   d["Total Raw Material Cost"] ?? 0,
      "Chem & Utilities": d["Total Chemical Inputs Utilities"] ?? 0,
      "Labor":            d["Total Labor Costs"] ?? 0,
      "Supply & Maint":   d["Supply Maint Costs"] ?? 0,
      "AFC":              d["AFC Pre Patents"] ?? 0,
      "Indirect Fixed":   d["Indirect Fixed Costs"] ?? 0,
    };
  });

  const unitData = names.map(name => {
    const d = scenarios[name];
    const cap = d["Capacity"] ?? 1;
    return {
      name,
      "OPEX/unit":  ((d["Total OPEX"] ?? 0) / cap),
      "TIC/unit":   ((d["Total Investment"] ?? 0) / cap),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Operating Expenses</h2>
        <p className="text-xs text-text-secondary mt-1 uppercase tracking-wider">OPEX breakdown — scenario comparison</p>
      </div>

      <SectionHeader title="Total OPEX per Scenario" />
      <div className="grid grid-cols-2 gap-4">
        {names.map((name, i) => {
          const d = scenarios[name];
          const varCost = (d["Total Raw Material Cost"] ?? 0) + (d["Total Chemical Inputs Utilities"] ?? 0);
          const fixCost = d["Total Fixed Costs"] ?? 0;
          return (
            <KpiCard
              key={name}
              label={`Total OPEX — ${name}`}
              value={formatSmart(d["Total OPEX"])}
              accentColor={PALETTE[i % PALETTE.length]}
              subLabel="Variable | Fixed"
              subValue={`${formatSmart(varCost)} | ${formatSmart(fixCost)}`}
            />
          );
        })}
      </div>

      <SectionHeader title="OPEX Composition" />
      <div className="h-80 bg-dark-card border border-dark-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={opexData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="name" stroke="#8b949e" tick={{ fontSize: 11 }} />
            <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1e6).toFixed(0)}M`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatSmart(v)} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="Raw Materials"    stackId="a" fill="#f85149" />
            <Bar dataKey="Chem & Utilities" stackId="a" fill="#ffa657" />
            <Bar dataKey="Labor"            stackId="a" fill="#e6a817" />
            <Bar dataKey="Supply & Maint"   stackId="a" fill="#d2a8ff" />
            <Bar dataKey="AFC"              stackId="a" fill="#79c0ff" />
            <Bar dataKey="Indirect Fixed"   stackId="a" fill="#58a6ff" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionHeader title="Unit Economics" />
      <div className="h-64 bg-dark-card border border-dark-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={unitData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="name" stroke="#8b949e" tick={{ fontSize: 11 }} />
            <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toFixed(0)}`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v.toFixed(2)}/unit`} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="OPEX/unit" fill="#e6a817" />
            <Bar dataKey="TIC/unit"  fill="#58a6ff" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
