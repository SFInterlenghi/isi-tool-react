import { useState } from 'react';
import { useStore } from '../store/useStore';
import SectionHeader from '../components/SectionHeader';
import { extractParams, computeIndicators, topsis } from '../utils/finance';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PALETTE = ["#e6a817", "#58a6ff", "#3fb950", "#f85149"];
const tooltipStyle = { backgroundColor: '#161b22', borderColor: '#21262d', color: '#e6edf3' };

const CRITERIA = [
  { key: "NPV",     label: "NPV",          isBenefit: true,  defaultWeight: 30 },
  { key: "IRR",     label: "IRR",          isBenefit: true,  defaultWeight: 20 },
  { key: "TIC",     label: "TIC (lower=better)", isBenefit: false, defaultWeight: 20 },
  { key: "Payback", label: "Payback (lower=better)", isBenefit: false, defaultWeight: 30 },
];

export default function MultiCriteria() {
  const scenarios = useStore(state => state.scenarios);
  const names = Object.keys(scenarios);
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(CRITERIA.map(c => [c.key, c.defaultWeight]))
  );

  const totalW = Object.values(weights).reduce((a, b) => a + b, 0);

  const results = names.map((name, i) => {
    const d = scenarios[name];
    const p = extractParams(d);
    const price = d["Main Product Price"] ?? 2000;
    const ind = computeIndicators(p, price);
    return { name, ind, color: PALETTE[i % PALETTE.length] };
  });

  const matrix = results.map(r =>
    CRITERIA.map(c => {
      const v = r.ind[c.key as keyof typeof r.ind];
      return (typeof v === 'number' && isFinite(v) ? v : 0) as number;
    })
  );

  const normWeights = CRITERIA.map(c => (weights[c.key] ?? 0) / (totalW || 1));
  const isBenefit   = CRITERIA.map(c => c.isBenefit);
  const scores      = topsis(matrix, normWeights, isBenefit);

  const ranked = results.map((r, i) => ({ ...r, score: scores[i] }))
    .sort((a, b) => b.score - a.score);

  const radarData = CRITERIA.map((c, j) => {
    const col  = matrix.map(row => row[j]);
    const min  = Math.min(...col);
    const max  = Math.max(...col);
    const range = max - min || 1;
    const row: any = { subject: c.label };
    results.forEach((r, i) => {
      let norm = (matrix[i][j] - min) / range;
      if (!c.isBenefit) norm = 1 - norm;
      row[r.name] = parseFloat(norm.toFixed(3));
    });
    return row;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Multi-Criteria Analysis</h2>
        <p className="text-xs text-text-secondary mt-1 uppercase tracking-wider">TOPSIS-based scenario ranking</p>
      </div>

      <SectionHeader title="Criteria Weights" />
      <div className="grid grid-cols-2 gap-6">
        {CRITERIA.map(c => (
          <div key={c.key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">{c.label}</span>
              <span className="font-mono text-accent">{weights[c.key]}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={weights[c.key]}
              onChange={e => setWeights(prev => ({ ...prev, [c.key]: Number(e.target.value) }))}
              className="w-full accent-amber-500"
            />
          </div>
        ))}
      </div>
      <div className="text-xs text-text-secondary">
        Total weight: <span className={`font-mono ${totalW === 100 ? 'text-green-400' : 'text-red-400'}`}>{totalW}%</span>
        {totalW !== 100 && <span className="ml-2 text-red-400">— weights are normalized automatically</span>}
      </div>

      <SectionHeader title="TOPSIS Ranking" color="#3fb950" />
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              <th className="py-3 px-4 text-xs text-text-secondary w-16 text-center">Rank</th>
              <th className="py-3 px-4 text-xs text-text-secondary">Scenario</th>
              <th className="py-3 px-4 text-xs text-accent text-right">Score</th>
              <th className="py-3 px-4 text-xs text-text-secondary text-right">NPV</th>
              <th className="py-3 px-4 text-xs text-text-secondary text-right">IRR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/40">
            {ranked.map((r, i) => (
              <tr key={r.name} className={i === 0 ? 'bg-accent/5' : 'hover:bg-dark-border/20'}>
                <td className="py-3 px-4 text-center text-base">{['🥇','🥈','🥉'][i] ?? `#${i+1}`}</td>
                <td className="py-3 px-4 font-bold" style={{ color: r.color }}>{r.name}</td>
                <td className="py-3 px-4 font-mono font-bold text-accent text-right">{r.score.toFixed(4)}</td>
                <td className="py-3 px-4 font-mono text-sm text-right text-text-primary">
                  {r.ind.NPV !== undefined ? `$${(r.ind.NPV/1e6).toFixed(1)}M` : "—"}
                </td>
                <td className="py-3 px-4 font-mono text-sm text-right text-text-primary">
                  {r.ind.IRR !== null ? `${(r.ind.IRR*100).toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeader title="Radar Chart — Trade-off Visualization" color="#58a6ff" />
      <div className="h-96 bg-dark-card border border-dark-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#21262d" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b949e', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {results.map(r => (
              <Radar key={r.name} name={r.name} dataKey={r.name}
                stroke={r.color} fill={r.color} fillOpacity={0.2} />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
