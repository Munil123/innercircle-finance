import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './index.css';

// Page Components
const AuthPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication</h1>
      <p className="text-gray-600">Welcome to Inner Circle Finance - Login/Register</p>
    </div>
  </div>
);

const DashboardPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Total Balance</h3>
        <p className="text-2xl font-bold text-primary-600">$12,345.67</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Monthly Income</h3>
        <p className="text-2xl font-bold text-green-600">$5,678.90</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Investments</h3>
        <p className="text-2xl font-bold text-blue-600">$8,901.23</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Lending</h3>
        <p className="text-2xl font-bold text-purple-600">$3,456.78</p>
      </div>
    </div>
  </div>
);

const TransactionsPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Transactions</h1>
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2025-08-10</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Investment Purchase</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">-$1,500.00</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Investment</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const InvestmentsPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Investments</h1>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Portfolio Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Stocks</span>
            <span className="font-semibold">$4,500.00</span>
          </div>
          <div className="flex justify-between">
            <span>Bonds</span>
            <span className="font-semibold">$2,100.00</span>
          </div>
          <div className="flex justify-between">
            <span>Crypto</span>
            <span className="font-semibold">$2,301.23</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LendingPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Lending</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Active Loans</h3>
      <p className="text-gray-600">Manage your lending portfolio and track returns.</p>
    </div>
  </div>
);

const ReportsPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Monthly Report</h3>
        <p className="text-gray-600">Generate comprehensive financial reports.</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Tax Summary</h3>
        <p className="text-gray-600">Tax-related financial summaries.</p>
      </div>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>
    </div>
  </div>
);

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-100">
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold text-primary-600">
              Inner Circle Finance
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2">Dashboard</Link>
              <Link to="/transactions" className="text-gray-700 hover:text-primary-600 px-3 py-2">Transactions</Link>
              <Link to="/investments" className="text-gray-700 hover:text-primary-600 px-3 py-2">Investments</Link>
              <Link to="/lending" className="text-gray-700 hover:text-primary-600 px-3 py-2">Lending</Link>
              <Link to="/reports" className="text-gray-700 hover:text-primary-600 px-3 py-2">Reports</Link>
              <Link to="/settings" className="text-gray-700 hover:text-primary-600 px-3 py-2">Settings</Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link to="/auth" className="text-gray-700 hover:text-primary-600 px-3 py-2">Sign Out</Link>
          </div>
        </div>
      </div>
    </nav>
    <main>{children}</main>
  </div>
);

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/transactions" element={<Layout><TransactionsPage /></Layout>} />
        <Route path="/investments" element={<Layout><InvestmentsPage /></Layout>} />
        <Route path="/lending" element={<Layout><LendingPage /></Layout>} />
        <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
        <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
