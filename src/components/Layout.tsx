import { NavLink } from 'react-router-dom';
import { Home, Settings, DollarSign, Activity, LineChart, AlertTriangle, GitCompare, Target } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/input', label: 'Input Data', icon: Settings },
  { path: '/investment', label: 'Investment Costs', icon: DollarSign },
  { path: '/opex', label: 'Operating Expenses', icon: Activity },
  { path: '/cashflow', label: 'Cash Flow & Analysis', icon: LineChart },
  { path: '/risk', label: 'Risk & Sensitivity', icon: AlertTriangle },
  { path: '/comparison', label: 'Scenario Comparison', icon: GitCompare },
  { path: '/mca', label: 'Multi-Criteria Analysis', icon: Target },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-dark-bg text-text-primary overflow-hidden">
      <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col shrink-0">
        <div className="p-6 border-b border-dark-border">
          <h1 className="text-xl font-bold text-accent">ISI-Tool</h1>
          <p className="text-xs text-text-secondary mt-1 tracking-wider uppercase">Economic Evaluation</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:bg-dark-border hover:text-text-primary"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-dark-border">
          <p className="text-[0.65rem] text-text-secondary text-center tracking-wider uppercase">v1.0 React Port</p>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
