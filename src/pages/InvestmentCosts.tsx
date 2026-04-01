import { useStore } from '../store/useStore';
import SectionHeader from '../components/SectionHeader';
import KpiCard from '../components/KpiCard';
import ScenarioBadge from '../components/ScenarioBadge';
import { formatSmart, formatCompact } from '../utils/formatters';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const PALETTE = ["#e6a817", "#58a6ff", "#3fb950", "#f85149", "#bc8cff", "#ffb74d"];

export default function InvestmentCosts() {
  const scenarios = useStore(state => state.scenarios);
  const names = Object.keys(scenarios);

  const ticData = names.map(name => ({
    name,
    CAPEX:            scenarios[name]["Project CAPEX"] ?? 0,
    "Working Capital": scenarios[name]["Working Capital"] ?? 0,
    "Startup":         scenarios[name]["Startup Costs"] ?? 0,
  }));

  const capexData = names.map(name => ({
    name,
    "Equipment":      scenarios[name]["Total Equipment Costs"] ?? 0,
    "Installation":   scenarios[name]["Total Installation Costs"] ?? 0,
    "Indirect Field": scenarios[name]["Total Indirect Field Costs"] ?? 0,
    "Non-Field":      scenarios[name]["Total Non-Field Costs"] ?? 0,
  }));

  const tooltipStyle = { backgroundColor: '#161b22', borderColor: '#21262d', color: '#e6edf3' };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Investment Costs</h2>
        <p className="text-xs text-text-secondary mt-1 uppercase tracking-wider">Total Investment Cost — scenario breakdown</p>
      </div>

      <SectionHeader title="Scenario Overview" />
      <div className="grid grid-cols-2 gap-4">
        {names.map((name, i) => (
          <ScenarioBadge key={name} name={name} data={scenarios[name]} color={PALETTE[i % PALETTE.length]} />
        ))}
      </div>

      <SectionHeader title="Total Investment Cost" />
      <div className="grid grid-cols-2 gap-4">
        {names.map((name, i) => {
          const d = scenarios[name];
          return (
            <KpiCard
              key={name}
              label={`TIC — ${name}`}
              value={formatSmart(d["Total Investment"])}
              accentColor={PALETTE[i % PALETTE.length]}
              subLabel="CAPEX | WC | Startup"
              subValue={`${formatCompact(d["Project CAPEX"])} | ${formatCompact(d["Working Capital"])} | ${formatCompact(d["Startup Costs"])}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <SectionHeader title="TIC Composition" />
          <div className="h-72 bg-dark-card border border-dark-border rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                <XAxis dataKey="name" stroke="#8b949e" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1e6).toFixed(0)}M`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatSmart(v)} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="CAPEX" stackId="a" fill="#e6a817" />
                <Bar dataKey="Working Capital" stackId="a" fill="#3fb950" />
                <Bar dataKey="Startup" stackId="a" fill="#58a6ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <SectionHeader title="CAPEX Components" />
          <div className="h-72 bg-dark-card border border-dark-border rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capexData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                <XAxis dataKey="name" stroke="#8b949e" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1e6).toFixed(0)}M`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatSmart(v)} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Equipment"      fill="#e6a817" />
                <Bar dataKey="Installation"   fill="#58a6ff" />
                <Bar dataKey="Indirect Field" fill="#3fb950" />
                <Bar dataKey="Non-Field"      fill="#bc8cff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <SectionHeader title="ISBL vs OSBL Split" />
      <div className="grid grid-cols-2 gap-6">
        {names.map((name, i) => {
          const d = scenarios[name];
          const isbl = d["ISBL Contribution (%)"] ?? 0;
          const osbl = d["OSBL Contribution (%)"] ?? 0;
          const pieData = [
            { name: "ISBL", value: isbl },
            { name: "OSBL", value: osbl },
          ];
          return (
            <div key={name} className="bg-dark-card border border-dark-border rounded-lg p-4">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{name} — ISBL/OSBL</div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                      <Cell fill={PALETTE[i % PALETTE.length]} />
                      <Cell fill="#21262d" />
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
