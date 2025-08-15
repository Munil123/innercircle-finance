// apps/web/src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Transactions from './Transactions';
import Investments from './Investments';
import Lending from './Lending';
import Reports from './Reports';
import Settings from './Settings';
import Auth from './components/Auth'; // Adjust the path if needed

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/investments" element={<Investments />} />
      <Route path="/lending" element={<Lending />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      {/* Redirect root to dashboard or login */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {/* Fallback for undefined routes */}
      <Route path="*" element={<div>404: Page Not Found</div>} />
    </Routes>
  </BrowserRouter>
);

export default App;

