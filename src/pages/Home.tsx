import { useStore } from '../store/useStore';
import { Settings, DollarSign, Activity, LineChart } from 'lucide-react';
import { formatSmart } from '../utils/formatters';

const PALETTE = ["#e6a817", "#58a6ff", "#3fb950", "#f85149"];

export default function Home() {
  const scenarios = useStore(state => state.scenarios);
  const entries = Object.entries(scenarios);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">ISI-Tool</h2>
        <p className="text-xs text-text-secondary uppercase tracking-wider mt-1">Chemical Plant Economic Evaluation</p>
      </div>

      <div className="grid grid-cols-5 gap-8 items-start">
        <div className="col-span-3 text-text-secondary text-sm leading-relaxed space-y-3">
          <p>A techno-economic analysis platform for early-stage chemical process evaluation. Configure scenarios, compute CAPEX/OPEX breakdowns, and run cash flow analyses driven by industry-standard cost estimation methodologies.</p>
          <p>Navigate using the sidebar. Start with <strong className="text-text-primary">Investment Costs</strong> or <strong className="text-text-primary">Cash Flow</strong> to explore the loaded scenarios.</p>
        </div>
        <div className="col-span-2 bg-dark-card border border-dark-border rounded-lg p-6 text-center">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-2">Scenarios Loaded</div>
          <div className="text-5xl font-mono font-bold text-accent">{entries.length}</div>
        </div>
      </div>

      <div>
        <div className="text-[0.7rem] font-bold uppercase tracking-[0.15em] pb-1.5 border-b border-dark-border mb-4 text-accent">
          Workflow
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Settings,   title: "1. Configure",  desc: "Define product, capacity, equipment costs and process parameters." },
            { icon: DollarSign, title: "2. Investment",  desc: "Review CAPEX build-up, TIC bands and ISBL/OSBL split." },
            { icon: Activity,   title: "3. OPEX",        desc: "Analyze variable and fixed cost structures by component." },
            { icon: LineChart,  title: "4. Cash Flow",   desc: "Edit prices, compute NPV/IRR/MSP and run sensitivity analysis." },
          ].map((step, i) => (
            <div key={i} className="bg-dark-card border border-dark-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-accent">
                <step.icon className="w-4 h-4" />
                <span className="text-sm font-semibold">{step.title}</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[0.7rem] font-bold uppercase tracking-[0.15em] pb-1.5 border-b border-dark-border mb-4 text-accent">
          Loaded Scenarios
        </div>
        <div className="grid grid-cols-4 gap-4">
          {entries.map(([name, data], i) => (
            <div key={name} className="bg-dark-card border border-dark-border rounded-lg p-4" style={{ borderLeft: `3px solid ${PALETTE[i % PALETTE.length]}` }}>
              <div className="font-bold mb-1" style={{ color: PALETTE[i % PALETTE.length] }}>{name}</div>
              <div className="text-xs text-text-secondary mb-3">{data["Product Name"]} · {data["TRL"]}</div>
              <div className="text-[0.7rem] text-text-secondary uppercase tracking-wider mb-0.5">Total Investment</div>
              <div className="font-mono text-sm text-accent">{formatSmart(data["Total Investment"])}</div>
              <div className="text-[0.7rem] text-text-secondary uppercase tracking-wider mb-0.5 mt-2">Total OPEX</div>
              <div className="font-mono text-sm text-text-primary">{formatSmart(data["Total OPEX"])}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
