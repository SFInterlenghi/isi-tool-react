import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface EditableCellProps {
  value: number;
  defaultValue: number;
  onChange: (val: number) => void;
  onReset: () => void;
  unit?: string;
}

export default function EditableCell({ value, defaultValue, onChange, onReset, unit }: EditableCellProps) {
  const [localVal, setLocalVal] = useState(value.toString());
  const isModified = Math.abs(value - defaultValue) > 1e-9;

  useEffect(() => {
    setLocalVal(value.toString());
  }, [value]);

  const handleBlur = () => {
    const num = parseFloat(localVal);
    if (!isNaN(num)) onChange(num);
    else setLocalVal(value.toString());
  };

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        className={`w-28 bg-dark-bg border rounded px-2 py-1 text-sm font-mono focus:outline-none focus:border-accent transition-colors ${
          isModified ? 'border-accent text-accent' : 'border-dark-border text-text-primary'
        }`}
      />
      {unit && <span className="text-xs text-text-secondary shrink-0">{unit}</span>}
      <button
        onClick={onReset}
        disabled={!isModified}
        title={`Reset to ${defaultValue}`}
        className={`p-1 rounded transition-colors shrink-0 ${
          isModified ? 'text-accent hover:bg-dark-border cursor-pointer' : 'text-transparent cursor-default'
        }`}
      >
        <RotateCcw className="w-3 h-3" />
      </button>
    </div>
  );
}
