import { useStore } from '../store/useStore';
import SectionHeader from '../components/SectionHeader';
import { extractParams, npvAtPrice } from '../utils/finance';
import { formatSmart } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const tooltipStyle = { backgroundColor: '#161b22', borderColor: '#21262d', color: '#e6edf3' };

export default function RiskSensitivity() {
  const { scenarios, activeScenario, setActiveScenario } = useStore();
  const names = Object.keys(scenarios);
  const d = scenarios[activeScenario];
  const p = extractParams(d);
  const basePrice = d["Main Product Price"] ?? 2000;
  const baseNpv = npvAtPrice(p, basePrice);

  // Tornado — ±20% perturbation
  const delta = 0.2;
  const sensitVars = [
    { name: "Product Price",   key: "productPrice" },
    { name: "CAPEX",           key: "capex" },
    { name: "Raw Materials",   key: "rm_base" },
    { name: "Chem & Utilities", key: "cu_base" },
    { name: "Labor",           key: "labor" },
    { name: "MARR",            key: "marr" },
  ];

  const tornadoData = sensitVars.map(v => {
    let npvLo: number, npvHi: number;
    if (v.key === "productPrice") {
      npvLo = npvAtPrice(p, basePrice * (1 - delta));
      npvHi = npvAtPrice(p, basePrice * (1 + delta));
    } else {
      const pLo = { ...p, [v.key]: (p[v.key as keyof typeof p] as number) * (1 - delta) };
      const pHi = { ...p, [v.key]: (p[v.key as keyof typeof p] as number) * (1 + delta) };
      npvLo = npvAtPrice(pLo as any, basePrice);
      npvHi = npvAtPrice(pHi as any, basePrice);
    }
    return {
      name: v.name,
      low:  (npvLo - baseNpv) / 1e6,
      high: (npvHi - baseNpv) / 1e6,
      spread: Math.abs(npvHi - npvLo) / 1e6,
    };
  }).sort((a, b) => b.spread - a.spread);

  // Monte Carlo — 500 samples
  const MC_SAMPLES = 500;
  const mcResults: number[] = [];
  for (let i = 0; i < MC_SAMPLES; i++) {
    const randNorm = () => {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const pSample = {
      ...p,
      capex:   p.capex   * (1 + 0.15 * randNorm()),
      rm_base: p.rm_base * (1 + 0.10 * randNorm()),
      cu_base: p.cu_base * (1 + 0.10 * randNorm()),
      labor:   p.labor   * (1 + 0.05 * randNorm()),
    };
    const price = basePrice * (1 + 0.10 * randNorm());
    mcResults.push(npvAtPrice(pSample as any, price) / 1e6);
  }
  mcResults.sort((a, b) => a - b);

  const minNpv = mcResults[0];
  const maxNpv = mcResults[mcResults.length - 1];
  const bins = 20;
  const binSize = (maxNpv - minNpv) / bins || 1;
  const histogram = Array.from({ length: bins }, (_, i) => ({
    npv: minNpv + i * binSize + binSize / 2,
    count: mcResults.filter(v => v >= minNpv + i * binSize && v < minNpv + (i + 1) * binSize).length,
  }));

  const p10 = mcResults[Math.floor(MC_SAMPLES * 0.10)];
  const p50 = mcResults[Math.floor(MC_SAMPLES * 0.50)];
  const p90 = mcResults[Math.floor(MC_SAMPLES * 0.90)];
  const probPositive = (mcResults.filter(v => v >= 0).length / MC_SAMPLES * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Risk & Sensitivity</h2>
        <p className="text-xs text-text-secondary mt-1 uppercase tracking-wider">Tornado · Monte Carlo</p>
      </div>

      <div className="flex gap-3">
        {names.map(name => (
          <button key={name} onClick={() => setActiveScenario(name)}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              activeScenario === name ? 'border-accent bg-accent/10 text-accent' : 'border-dark-border text-text-secondary hover:border-accent/50'
            }`}>{name}</button>
        ))}
      </div>

      <SectionHeader title="Tornado Chart — 1D Sensitivity (±20%)" />
      <div className="bg-dark-card border border-dark-border rounded-lg p-4 text-xs text-text-secondary mb-2">
        Base NPV: <span className="font-mono text-accent">{formatSmart(baseNpv)}</span> · Each bar shows ΔNPV from ±20% perturbation on that variable
      </div>
      <div className="h-80 bg-dark-card border border-dark-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={tornadoData} layout="vertical" margin={{ left: 20, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
            <XAxis type="number" stroke="#8b949e" tick={{ fontSize: 11 }} tickFormatter={v => `${v.toFixed(0)}M`} />
            <YAxis dataKey="name" type="category" stroke="#8b949e" tick={{ fontSize: 11 }} width={120} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toFixed(1)}M`, undefined]} />
            <ReferenceLine x={0} stroke="#8b949e" />
            <Bar dataKey="low"  name="-20%" fill="#f85149" />
            <Bar dataKey="high" name="+20%" fill="#3fb950" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionHeader title={`Monte Carlo Simulation — ${MC_SAMPLES} samples`} color="#58a6ff" />
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-dark-card border border-dark-border rounded-md p-3" style={{ borderLeft: '3px solid #f85149' }}>
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">P10 NPV</div>
          <div className="font-mono text-sm text-red-400">${p10.toFixed(1)}M</div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-md p-3" style={{ borderLeft: '3px solid #e6a817' }}>
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">P50 NPV</div>
          <div className="font-mono text-sm text-accent">${p50.toFixed(1)}M</div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-md p-3" style={{ borderLeft: '3px solid #3fb950' }}>
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">P90 NPV</div>
          <div className="font-mono text-sm text-green-400">${p90.toFixed(1)}M</div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-md p-3" style={{ borderLeft: '3px solid #58a6ff' }}>
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">P(NPV &gt; 0)</div>
          <div className="font-mono text-sm text-blue-400">{probPositive}%</div>
        </div>
      </div>
      <div className="h-64 bg-dark-card border border-dark-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogram}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="npv" stroke="#8b949e" tick={{ fontSize: 10 }} tickFormatter={v => `${v.toFixed(0)}M`} />
            <YAxis stroke="#8b949e" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, _: string, props: any) => [v, `NPV ~$${props.payload.npv.toFixed(0)}M`]} />
            <ReferenceLine x={0} stroke="#484f58" strokeDasharray="4 4" />
            <Bar dataKey="count" name="Frequency">
              {histogram.map((entry, i) => (
                <Cell key={i} fill={entry.npv >= 0 ? '#3fb950' : '#f85149'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
