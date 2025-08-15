import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (you'll need to add your actual URL and key)
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || '',
  process.env.REACT_APP_SUPABASE_ANON_KEY || ''
);

interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  description?: string;
  user_id: string;
  circle_id?: string;
}

interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current month's start and end dates
  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0]
    };
  };

  // Fetch transactions from Supabase
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { start, end } = getCurrentMonthRange();
      
      // Get current user (you'll need to implement proper auth)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      calculateMetrics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  // Calculate financial metrics
  const calculateMetrics = (transactionData: Transaction[]) => {
    const totalIncome = transactionData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactionData
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    setMetrics({
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses
    });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Financial Dashboard</h1>
      
      {/* Financial Metrics Cards */}
      <div className="metrics-cards">
        <div className="metric-card income">
          <h3>Total Income</h3>
          <div className="amount">${metrics.totalIncome.toFixed(2)}</div>
        </div>
        <div className="metric-card expenses">
          <h3>Total Expenses</h3>
          <div className="amount">${metrics.totalExpenses.toFixed(2)}</div>
        </div>
        <div className="metric-card savings">
          <h3>Net Savings</h3>
          <div className={`amount ${metrics.netSavings >= 0 ? 'positive' : 'negative'}`}>
            ${metrics.netSavings.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <p>Dashboard implementation in progress...</p>
        <p>Transactions loaded: {transactions.length}</p>
      </div>
    </div>
  );
};

export default Dashboard;
