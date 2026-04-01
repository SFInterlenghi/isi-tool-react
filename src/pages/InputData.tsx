import { useStore } from '../store/useStore';
import SectionHeader from '../components/SectionHeader';
import ScenarioBadge from '../components/ScenarioBadge';

const PALETTE = ["#e6a817", "#58a6ff", "#3fb950", "#f85149"];

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1 uppercase tracking-wider">{label}</label>
      <div className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm font-mono text-text-primary">
        {value ?? "—"}
      </div>
    </div>
  );
}

export default function InputData() {
  const { scenarios, activeScenario, setActiveScenario } = useStore();
  const names = Object.keys(scenarios);
  const d = scenarios[activeScenario];
  const idx = names.indexOf(activeScenario);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Scenario Configuration</h2>
        <p className="text-xs text-text-secondary mt-1 uppercase tracking-wider">Read-only view of loaded scenario parameters</p>
      </div>

      <SectionHeader title="Scenario Selection" />
      <div className="flex gap-3 items-center">
        {names.map((name) => (
          <button
            key={name}
            onClick={() => setActiveScenario(name)}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              activeScenario === name
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-dark-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <ScenarioBadge name={activeScenario} data={d} color={PALETTE[idx % PALETTE.length]} />

      <SectionHeader title="Basic Information" />
      <div className="grid grid-cols-3 gap-4">
        <Field label="Product Name" value={d["Product Name"]} />
        <Field label="Capacity" value={d["Capacity Label"]} />
        <Field label="Working Hours / Year" value={d["Working Hours per Year"]} />
      </div>

      <SectionHeader title="Investment Cost Sources" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Equipment Costs Source" value={d["Equipment Costs Source"]} />
        <Field label="Other Costs Source" value={d["Other Costs Source"]} />
      </div>

      <SectionHeader title="Process Classification" />
      <div className="grid grid-cols-3 gap-4">
        <Field label="Product Type" value={d["Product Type"]} />
        <Field label="TRL" value={d["TRL"]} />
        <Field label="Process Severity" value={d["Process Severity"]} />
        <Field label="Material Handled" value={d["Material Handled"]} />
        <Field label="Plant Size" value={d["Plant Size"]} />
        <Field label="Project Location" value={d["Project Location"]} />
      </div>

      <SectionHeader title="Financial Parameters" />
      <div className="grid grid-cols-3 gap-4">
        <Field label="MARR" value={`${((d["MARR"] ?? 0) * 100).toFixed(2)}%`} />
        <Field label="Tax Rate" value={`${((d["Tax Rate"] ?? 0) * 100).toFixed(1)}%`} />
        <Field label="Project Lifetime" value={`${d["Project Lifetime"]} years`} />
        <Field label="Depreciation Method" value={d["Depreciation Method"]} />
        <Field label="Depreciation Years" value={d["Depreciation Years"]} />
        <Field label="Financing Type" value={d["Financing Type"]} />
      </div>

      <SectionHeader title="Raw Materials" />
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              {["Name", "Rate", "Unit", "Price", "Price Unit"].map(h => (
                <th key={h} className="py-2 px-4 text-xs font-medium text-text-secondary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/50">
            {(d["Raw Materials"] || []).map((item: any) => (
              <tr key={item.Name} className="hover:bg-dark-border/20">
                <td className="py-2 px-4 text-sm">{item.Name}</td>
                <td className="py-2 px-4 text-sm font-mono">{item.Rate}</td>
                <td className="py-2 px-4 text-sm text-text-secondary">{item["Rate Unit"]}</td>
                <td className="py-2 px-4 text-sm font-mono text-accent">{item.Price}</td>
                <td className="py-2 px-4 text-sm text-text-secondary">{item["Price Unit"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeader title="Chemical Inputs & Utilities" />
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              {["Name", "Rate", "Unit", "Price", "Price Unit"].map(h => (
                <th key={h} className="py-2 px-4 text-xs font-medium text-text-secondary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/50">
            {(d["Chemical Inputs and Utilities"] || []).map((item: any) => (
              <tr key={item.Name} className="hover:bg-dark-border/20">
                <td className="py-2 px-4 text-sm">{item.Name}</td>
                <td className="py-2 px-4 text-sm font-mono">{item.Rate}</td>
                <td className="py-2 px-4 text-sm text-text-secondary">{item["Rate Unit"]}</td>
                <td className="py-2 px-4 text-sm font-mono text-accent">{item.Price}</td>
                <td className="py-2 px-4 text-sm text-text-secondary">{item["Price Unit"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
