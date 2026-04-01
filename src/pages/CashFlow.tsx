import { useStore } from '../store/useStore';
import SectionHeader from '../components/SectionHeader';
import KpiCard from '../components/KpiCard';
import EditableCell from '../components/EditableCell';
import { formatSmart, formatCurrency, formatPercent } from '../utils/formatters';
import { extractParams, computeIndicators } from '../utils/finance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const PALETTE = ["#e6a817", "#58a6ff", "#3fb950", "#f85149"];
const tooltipStyle = { backgroundColor: '#161b22', borderColor: '#21262d', color: '#e6edf3' };

export default function CashFlow() {
  const { scenarios, activeScenario, priceOverrides, setPriceOverride, setActiveScenario } = useStore();
  const names = Object.keys(scenarios);
  const d = scenarios[activeScenario];
  const overrides = priceOverrides[activeScenario] || {};
  const idx = names.indexOf(activeScenario);

  const p = extractParams(d);
  const basePrice = d["Main Product Price"] ?? 2000;
  const ind = computeIndicators(p, basePrice);

  const cfChartData = ind.acpvs.map((v, i) => ({ year: i - (p.epc_yrs + 1), cumPV: v / 1e6 }));

  const renderTable = (title: string, items: any[], isCredit = false) => {
    if (!items || items.length === 0) return null;
    const accentColor = isCredit ? '#3fb950' : '#e6a817';

    return (
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>{title}</div>
        <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-dark-bg border-b border-dark-border">
              <tr>
                <th className="py-2 px-3 text-xs text-text-secondary">Name</th>
                <th className="py-2 px-3 text-xs text-accent">Price (editable)</th>
                <th className="py-2 px-3 text-xs text-text-secondary text-right">Rate</th>
                <th className="py-2 px-3 text-xs text-text-secondary text-right">Tech. Coeff.</th>
                <th className="py-2 px-3 text-xs text-text-secondary text-right">Annual Cost</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => {
                const name = item.Name;
                const defaultPrice = item.Price;
                const currentPrice = overrides[name] !== undefined ? overrides[name] : defaultPrice;
                const prodRate = p.capacity / p.working_hours;
                const techCoeff = prodRate > 0 ? item.Rate / prodRate : 0;
                const annualCost = item.Rate * currentPrice * p.working_hours;
                return (
                  <tr key={name} className="border-b border-dark-border/40 hover:bg-dark-border/20">
                    <td className="py-2 px-3 text-sm">{name}</td>
                    <td className="py-2 px-3">
                      <EditableCell
                        value={currentPrice}
                        defaultValue={defaultPrice}
                        onChange={val => setPriceOverride(activeScenario, name, val)}
                        onReset={() => setPriceOverride(activeScenario, name, null)}
                        unit={item["Price Unit"]}
                      />
                    </td>
                    <td className="py-2 px-3 text-xs font-mono text-right text-text-secondary">
                      {item.Rate.toFixed(3)} {item["Rate Unit"]}
                    </td>
                    <td className="py-2 px-3 text-xs font-mono text-right text-text-secondary">
                      {techCoeff.toFixed(4)}
                    </td>
                    <td className="py-2 px-3 text-sm font-mono text-right" style={{ color: accentColor }}>
                      {formatSmart(annualCost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cash Flow & Analysis</h2>
        <p className="text-xs text-text-secondary mt-1 uppercase tracking-wider">Interactive economic analysis</p>
      </div>

      <div className="flex gap-3">
        {names.map((name, i) => (
          <button
            key={name}
            onClick={() => setActiveScenario(name)}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              activeScenario === name
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-dark-border text-text-secondary hover:border-accent/50'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <SectionHeader title="Scenario Summary" color="#58a6ff" />
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Main Product" value={d["Product Name"]} subLabel="Capacity" subValue={d["Capacity Label"]} />
        <KpiCard label="Total Investment (TIC)" value={formatSmart(d["Total Investment"])} accentColor="#58a6ff" />
        <KpiCard label="Total Annual OPEX" value={formatSmart(d["Total OPEX"])} accentColor="#3fb950" />
      </div>

      <SectionHeader title="Variable Costs & Credits" />
      {renderTable("Raw Materials", d["Raw Materials"] || [])}
      {renderTable("Chemical Inputs & Utilities", d["Chemical Inputs and Utilities"] || [])}
      {renderTable("Credits & Byproducts", d["Credits and Byproducts"] || [], true)}

      <SectionHeader title="Financial Indicators" color="#bc8cff" />
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="NPV"
          value={formatSmart(ind.NPV)}
          accentColor={ind.NPV >= 0 ? "#3fb950" : "#f85149"}
          subLabel="MARR"
          subValue={formatPercent(ind.MARR)}
        />
        <KpiCard
          label="IRR"
          value={ind.IRR !== null ? formatPercent(ind.IRR) : "—"}
          accentColor="#e6a817"
          subLabel="vs MARR"
          subValue={ind.IRR !== null ? (ind.IRR >= ind.MARR ? "✓ Exceeds" : "✗ Below") : "—"}
        />
        <KpiCard
          label="MSP"
          value={ind.MSP !== null ? formatCurrency(ind.MSP) : "—"}
          accentColor="#58a6ff"
          subLabel="Unit"
          subValue={d["Unit"]}
        />
        <KpiCard
          label="Payback"
          value={ind.Payback !== null ? `${ind.Payback} yrs` : "—"}
          accentColor="#79c0ff"
          subLabel="Project life"
          subValue={`${p.op_yrs} yrs`}
        />
      </div>

      <SectionHeader title="Cumulative Discounted Cash Flow" color="#58a6ff" />
      <div className="h-72 bg-dark-card border border-dark-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cfChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis dataKey="year" stroke="#8b949e" tick={{ fontSize: 11 }} label={{ value: 'Year', position: 'insideBottom', offset: -2, fill: '#8b949e', fontSize: 11 }} />
            <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toFixed(0)}M`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toFixed(1)}M`, "Cum. PV"]} />
            <ReferenceLine y={0} stroke="#484f58" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="cumPV" stroke={PALETTE[idx % PALETTE.length]} strokeWidth={2.5} dot={false} name={activeScenario} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
