export const MACRS_7 = [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446];
export const MACRS_10 = [0.1000, 0.1800, 0.1440, 0.1152, 0.0922, 0.0737, 0.0655, 0.0655, 0.0656, 0.0655, 0.0328];

export function bisection(f: (x: number) => number, a: number, b: number, tol = 1e-5, maxIter = 200): number | null {
  if (f(a) * f(b) > 0) return null;
  let mid = a;
  for (let i = 0; i < maxIter; i++) {
    mid = (a + b) / 2;
    if (Math.abs(f(mid)) < tol || (b - a) / 2 < tol) return mid;
    if (f(mid) * f(a) > 0) a = mid; else b = mid;
  }
  return mid;
}

export function calculateIRR(cfs: number[]): number | null {
  const f = (r: number) => cfs.reduce((acc, val, i) => acc + val / Math.pow(1 + r, i), 0);
  return bisection(f, -0.99, 10.0);
}

export function extractParams(scenario: any, wif: Record<string, number> = {}) {
  const _w = (key: string, def = 0) => wif[key] !== undefined ? wif[key] : (scenario[key] ?? def);

  const capacity    = _w("Capacity");
  const working_hours = _w("Working Hours per Year", 8000);
  const capex       = _w("Project CAPEX");
  const wc          = scenario["Working Capital"] ?? 0;
  const startup     = scenario["Startup Costs"] ?? 0;
  const isbl_osbl   = scenario["Project Costs ISBL+OSBL"] ?? 0;

  const base_cap  = scenario["Capacity"] || 1;
  const cap_ratio = capacity / base_cap;

  const rm_base = (scenario["Total Raw Material Cost"] ?? 0) * cap_ratio;
  const cu_base = (scenario["Total Chemical Inputs Utilities"] ?? 0) * cap_ratio;
  const bp_base = (scenario["Total Revenue"] ?? 0) * cap_ratio;

  const n_ops        = _w("Num Operators", 2);
  const op_sal       = _w("Operator Salary", 1247.75);
  const n_sups       = _w("Num Supervisors", 1);
  const sup_sal      = _w("Supervisor Salary", 1660.15);
  const sal_charges  = _w("Salary Charges", 2.2);

  const plant_daily_hours  = scenario["Plant Daily Hours"] ?? 24;
  const weekly_op_days     = scenario["Weekly Op Days"] ?? 7;
  const worker_hours_shift = scenario["Worker Hours per Shift"] ?? 8;
  const worker_shifts_week = scenario["Worker Shifts per Week"] ?? 5;

  const op_team = Math.ceil((plant_daily_hours / worker_hours_shift) * (weekly_op_days / worker_shifts_week));
  const olc     = (n_ops * op_sal + n_sups * sup_sal) * (1 + sal_charges) * op_team * 12;

  const lab_pct = _w("Lab Charges Pct", 0.1);
  const off_pct = _w("Office Labor Pct", 0.1);
  const labor   = olc * (1 + lab_pct + off_pct);

  const maint_pct   = _w("Maint Pct", 0.01);
  const op_sup_pct  = _w("Op Sup Pct", 0.002);
  const supply_maint = (maint_pct + op_sup_pct) * capex;

  const admin_ov  = _w("Admin Ov Pct", 0.55);
  const mfg_ov    = _w("Mfg Ov Pct", 0.007);
  const taxes_ins = _w("Taxes Ins Pct", 0.05);
  const patents   = _w("Patents Pct", 0);
  const admin_costs = _w("Admin Costs Pct", 0.165);
  const mfg_costs   = _w("Mfg Costs Pct", 0.0015);
  const dist_sell   = _w("Dist Sell Pct", 0.08);
  const r_d         = _w("R D Pct", 0.03);

  const olc_coeff   = admin_ov + admin_costs;
  const capex_coeff = mfg_ov + taxes_ins + mfg_costs;
  const num  = rm_base + cu_base + labor + supply_maint + olc_coeff * olc + capex_coeff * capex;
  const den  = 1 - patents - dist_sell - r_d;
  const opex = den > 0 ? num / den : 0;

  const afc      = admin_ov * olc + (mfg_ov + taxes_ins) * capex + patents * opex;
  const indirect = admin_costs * olc + mfg_costs * capex + (dist_sell + r_d) * opex;

  const land_opt      = scenario["Land Option"] === "Buy" ? "Buy" : "Rent";
  const land_rent_pct = scenario["Land Rent Pct"] ?? 0.002;
  const land_buy_pct  = scenario["Land Buy Pct"] ?? 0.02;
  const land_rent_yr  = land_opt === "Rent" ? isbl_osbl * land_rent_pct : 0;
  const land_buy      = land_opt === "Buy"  ? isbl_osbl * land_buy_pct  : 0;

  const dep_method = scenario["Depreciation Method"] ?? "Straight Line";
  const dep_yrs    = scenario["Depreciation Years"] ?? 10;
  let resid_pct    = scenario["Residual Value Pct"] ?? 20;
  if (resid_pct > 1) resid_pct /= 100;

  let tax_rate = scenario["Tax Rate"] ?? 0.34;
  if (tax_rate > 1) tax_rate /= 100;

  const leveraged  = scenario["Financing Type"] === "Leveraged";
  let debt_ratio   = scenario["Debt Ratio"] ?? 0;
  const amort_yrs  = scenario["Amortization Years"] ?? 13;
  const grace_yrs  = scenario["Grace Period Years"] ?? 5;
  let cod          = scenario["COD"] ?? 0.055;
  if (cod > 1) cod /= 100;

  let marr = scenario["MARR"] ?? 0.144;
  if (marr > 1) marr /= 100;

  const epc_yrs = scenario["EPC Years"] ?? 2;
  const op_yrs  = scenario["Project Lifetime"] ?? 20;
  const total   = 1 + epc_yrs + op_yrs;
  const capex_fracs = epc_yrs === 1 ? [1.0] : epc_yrs === 2 ? [0.6, 0.4] : [0.3, 0.5, 0.2];

  return {
    capacity, working_hours, capex, wc, startup, isbl_osbl,
    rm_base, cu_base, bp_base, labor, supply_maint, afc, indirect, opex, olc,
    land_opt, land_buy, land_rent_yr, dep_method, dep_yrs, resid_pct,
    tax_rate, leveraged, debt_ratio, amort_yrs, grace_yrs, cod, marr,
    epc_yrs, op_yrs, total, capex_fracs,
  };
}

export function buildCfArrays(p: ReturnType<typeof extractParams>, productPrice: number, capexMult = 1.0) {
  const _c  = p.capex * capexMult;
  const _wc = p.wc * capexMult;
  const _su = p.startup * capexMult;
  const dep_sl = p.dep_yrs > 0 ? (_c * (1 - p.resid_pct)) / p.dep_yrs : 0;
  const mrat = p.dep_yrs <= 7 ? MACRS_7 : MACRS_10;

  const cfs: number[]   = [];
  const acpvs: number[] = [];
  let accum_pv = 0;

  for (let i = 0; i < p.total; i++) {
    const is_epc = i >= 1 && i <= p.epc_yrs;
    const oi     = i - (p.epc_yrs + 1);

    let inv = 0;
    if (i === 0) inv = p.land_opt === "Buy" ? -p.land_buy * capexMult : 0;
    else if (is_epc) inv = -_c * p.capex_fracs[i - 1];
    if (i === p.epc_yrs + 1) inv -= _wc + _su;
    if (oi === p.op_yrs - 1) {
      inv += _wc;
      if (p.land_opt === "Buy") inv += p.land_buy * capexMult;
    }

    let f_int = 0, f_amort = 0;
    if (p.leveraged) {
      const tot_d = _c * p.debt_ratio;
      f_int = -tot_d * p.cod;
      const ann_r = p.amort_yrs > 0 ? tot_d / p.amort_yrs : 0;
      if (oi >= p.grace_yrs && (oi - p.grace_yrs) < p.amort_yrs) f_amort = -ann_r;
    }

    if (i === 0 || is_epc) {
      const cf = inv + f_int + f_amort;
      const pv = cf / Math.pow(1 + p.marr, i);
      accum_pv += pv;
      cfs.push(cf);
      acpvs.push(accum_pv);
      continue;
    }

    const rev  = productPrice * p.capacity + p.bp_base + (oi === p.op_yrs - 1 ? _c * p.resid_pct : 0);
    const costs = -(p.rm_base + p.cu_base + p.labor + p.supply_maint + p.afc + p.indirect);
    const rent  = p.land_opt === "Rent" ? -p.land_rent_yr : 0;
    const dep   = p.dep_method === "Straight Line"
      ? (oi < p.dep_yrs ? -dep_sl : 0)
      : (oi < mrat.length ? -_c * mrat[oi] : 0);

    const ebt  = rev + costs + rent + dep + f_int;
    const tax  = -Math.max(0, ebt) * p.tax_rate;
    const cf   = ebt + tax - dep + f_amort + inv;
    const pv   = cf / Math.pow(1 + p.marr, i);
    accum_pv  += pv;
    cfs.push(cf);
    acpvs.push(accum_pv);
  }

  return { cfs, acpvs };
}

export function npvAtPrice(p: ReturnType<typeof extractParams>, price: number, capexMult = 1.0) {
  const { acpvs } = buildCfArrays(p, price, capexMult);
  return acpvs[acpvs.length - 1];
}

export function solvePriceForNpv(p: ReturnType<typeof extractParams>, targetNpv = 0, capexMult = 1.0) {
  const f = (pr: number) => npvAtPrice(p, pr, capexMult) - targetNpv;
  return bisection(f, 0.001, 1_000_000);
}

export function computeIndicators(p: ReturnType<typeof extractParams>, price: number, capexMult = 1.0) {
  const { cfs, acpvs } = buildCfArrays(p, price, capexMult);
  const tic     = p.capex * capexMult + p.wc * capexMult + p.startup * capexMult + (p.land_opt === "Buy" ? p.land_buy * capexMult : 0);
  const npv     = acpvs[acpvs.length - 1];
  const irr     = calculateIRR(cfs);
  const msp     = solvePriceForNpv(p, 0, capexMult);
  const pbIdx   = acpvs.findIndex(v => v >= 0);
  const payback = pbIdx !== -1 ? pbIdx - (p.epc_yrs + 1) : null;

  return { NPV: npv, IRR: irr, MSP: msp, Payback: payback, TIC: tic, MARR: p.marr, OPEX: p.opex, acpvs };
}

export function topsis(matrix: number[][], weights: number[], isBenefit: boolean[]) {
  const nAlt  = matrix.length;
  const nCrit = matrix[0].length;

  const norms = Array.from({ length: nCrit }, (_, j) =>
    Math.sqrt(matrix.reduce((s, row) => s + row[j] ** 2, 0)) || 1
  );

  const weighted = matrix.map(row => row.map((v, j) => (v / norms[j]) * weights[j]));

  const ideal     = Array.from({ length: nCrit }, (_, j) => {
    const col = weighted.map(r => r[j]);
    return isBenefit[j] ? Math.max(...col) : Math.min(...col);
  });
  const antiIdeal = Array.from({ length: nCrit }, (_, j) => {
    const col = weighted.map(r => r[j]);
    return isBenefit[j] ? Math.min(...col) : Math.max(...col);
  });

  return Array.from({ length: nAlt }, (_, i) => {
    const dPlus  = Math.sqrt(weighted[i].reduce((s, v, j) => s + (v - ideal[j]) ** 2, 0));
    const dMinus = Math.sqrt(weighted[i].reduce((s, v, j) => s + (v - antiIdeal[j]) ** 2, 0));
    return dMinus / (dPlus + dMinus || 1);
  });
}
