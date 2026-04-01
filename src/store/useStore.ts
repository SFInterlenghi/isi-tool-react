import { create } from 'zustand';
import { ATJ_SCENARIO } from '../data/ATJ';
import { CADO_SCENARIO } from '../data/CADO';

export interface StoreState {
  scenarios: Record<string, any>;
  activeScenario: string;
  whatIfOverrides: Record<string, Record<string, number>>;
  priceOverrides: Record<string, Record<string, number>>;
  setActiveScenario: (name: string) => void;
  setWhatIfOverride: (scenario: string, key: string, value: number | null) => void;
  setPriceOverride: (scenario: string, key: string, value: number | null) => void;
  resetWhatIfs: (scenario: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  scenarios: {
    "ATJ": ATJ_SCENARIO,
    "CADO": CADO_SCENARIO,
  },
  activeScenario: "ATJ",
  whatIfOverrides: {},
  priceOverrides: {},

  setActiveScenario: (name) => set({ activeScenario: name }),

  setWhatIfOverride: (scenario, key, value) => set((state) => {
    const scenOverrides = { ...(state.whatIfOverrides[scenario] || {}) };
    if (value === null) delete scenOverrides[key];
    else scenOverrides[key] = value;
    return { whatIfOverrides: { ...state.whatIfOverrides, [scenario]: scenOverrides } };
  }),

  setPriceOverride: (scenario, key, value) => set((state) => {
    const scenPrices = { ...(state.priceOverrides[scenario] || {}) };
    if (value === null) delete scenPrices[key];
    else scenPrices[key] = value;
    return { priceOverrides: { ...state.priceOverrides, [scenario]: scenPrices } };
  }),

  resetWhatIfs: (scenario) => set((state) => {
    const newWhatIfs = { ...state.whatIfOverrides };
    delete newWhatIfs[scenario];
    const newPrices = { ...state.priceOverrides };
    delete newPrices[scenario];
    return { whatIfOverrides: newWhatIfs, priceOverrides: newPrices };
  })
}));
