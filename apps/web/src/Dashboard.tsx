import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import WhatsAppShare from './WhatsAppShare';

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

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// Simple pie chart component using HTML/CSS
const SimplePieChart: React.FC<{ data: CategoryData[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="pie-chart-container">
        <h3>Spending by Category</h3>
        <div className="no-data">No expense data available</div>
      </div>
    );
  }

  let currentAngle = 0;
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const pathElements = data.map((item, index) => {
    const startAngle = currentAngle;
    const endAngle = currentAngle + (item.percentage * 360 / 100);
    currentAngle = endAngle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = item.percentage > 50 ? 1 : 0;

    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return (
      <path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="white"
        strokeWidth="2"
      />
    );
  });

  return (
    <div className="pie-chart-container">
      <h3>Spending by Category</h3>
      <div className="chart-and-legend">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {pathElements}
        </svg>
        <div className="legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: item.color }}
              />
              <span className="legend-text">
                {item.category}: ${item.amount.toFixed(2)} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0
  });
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Predefined colors for categories
  const categoryColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

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

  // Calculate category data for pie chart
  const calculateCategoryData = (transactionData: Transaction[]) => {
    const expenseTransactions = transactionData.filter(t => t.type === 'expense');
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (totalExpenses === 0) {
      setCategoryData([]);
      return;
    }

    // Group by category
    const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and calculate percentages
    const categoryArray = Object.entries(categoryTotals)
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100,
        color: categoryColors[index % categoryColors.length]
      }))
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending

    setCategoryData(categoryArray);
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
      calculateCategoryData(data || []);
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
      <div className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <div className="header-actions">
          <WhatsAppShare 
            variant="button" 
            className="share-button"
            customMessage="🚀 Take control of your finances with InnerCircle Finance! Join me and start your journey to financial freedom. Use my referral code: {referralCode} 💰📊 {inviteUrl}"
          />
        </div>
      </div>
      
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

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <SimplePieChart data={categoryData} />
        </div>
      </div>

      <div className="dashboard-content">
        <p>Dashboard implementation in progress...</p>
        <p>Transactions loaded: {transactions.length}</p>
        <p>Categories: {categoryData.length}</p>
      </div>

      <style jsx>{`
        .dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .dashboard-header h1 {
          margin: 0;
          color: #333;
        }
        
        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .share-button {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .metrics-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        
        .metric-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .metric-card h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          text-transform: uppercase;
          color: #666;
        }
        
        .amount {
          font-size: 24px;
          font-weight: bold;
        }
        
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
        
        .charts-section {
          margin: 30px 0;
        }
        
        .chart-container {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .pie-chart-container h3 {
          margin: 0 0 20px 0;
          text-align: center;
        }
        
        .chart-and-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }
        
        .legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 2px;
        }
        
        .legend-text {
          font-size: 14px;
        }
        
        .no-data {
          text-align: center;
          color: #666;
          font-style: italic;
        }
        
        .loading, .error {
          text-align: center;
          padding: 40px;
        }
        
        .error {
          color: #dc3545;
        }
        
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .header-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
