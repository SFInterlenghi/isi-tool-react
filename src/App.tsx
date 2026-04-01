import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import InputData from './pages/InputData';
import InvestmentCosts from './pages/InvestmentCosts';
import OperatingExpenses from './pages/OperatingExpenses';
import CashFlow from './pages/CashFlow';
import RiskSensitivity from './pages/RiskSensitivity';
import ScenarioComparison from './pages/ScenarioComparison';
import MultiCriteria from './pages/MultiCriteria';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/input" element={<InputData />} />
          <Route path="/investment" element={<InvestmentCosts />} />
          <Route path="/opex" element={<OperatingExpenses />} />
          <Route path="/cashflow" element={<CashFlow />} />
          <Route path="/risk" element={<RiskSensitivity />} />
          <Route path="/comparison" element={<ScenarioComparison />} />
          <Route path="/mca" element={<MultiCriteria />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
