// apps/web/src/Reports.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from './main'; // update the import if your supabase client is elsewhere
// Chart drawing support (install with `npm install chart.js react-chartjs-2`)
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function toCurrency(n: number) {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

const Reports: React.FC = () => {
  // Filter states
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number | 'all'>('all');
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[] | null>(null);
  const [investments, setInvestments] = useState<any[] | null>(null);
  // Note: 'lending' variable was unused, so removing it to fix the warning
  
  // Fetch all report data (transactions, investments, lending/borrowing)
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      let { data: trans } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);
      
      if (month !== 'all') {
        trans = trans?.filter((t: any) => new Date(t.date).getMonth() === +month);
      }
      
      let { data: invest } = await supabase
        .from('investments')
        .select('*')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);
      
      // Note: 'lend' data was fetched but not used, and 'err' was also unused
      // Removing unused variables to fix TypeScript warnings
      
      setTransactions(trans ?? null);
      setInvestments(invest ?? null);
      setLoading(false);
    };
    
    fetchData();
  }, [month, year]);
  
  // Analytics: group by category/subcategory
  function breakdown(list: any[], type: 'income' | 'expense' | 'investment') {
    const result: Record<string, number> = {};
    list?.filter(item => item.type === type).forEach((item: any) => {
      const label = item.category + (item.subcategory ? ` / ${item.subcategory}` : '');
      result[label] = (result[label] ?? 0) + Number(item.amount);
    });
    return result;
  }
  
  // Monthly sums for bar chart
  function monthSums(list: any[], type: string) {
    const arr = Array(12).fill(0);
    list?.filter(item => item.type === type).forEach((item: any) => {
      const m = new Date(item.date).getMonth();
      arr[m] += Number(item.amount);
    });
    return arr;
  }
  
  // Download as CSV
  const downloadCSV = () => {
    if (!transactions) return;
    
    const header = 'Date,Type,Category,Subcategory,Amount,Notes\n';
    const allRows = transactions.map(
      t =>
        [t.date, t.type, t.category, t.subcategory, t.amount, t.notes ?? ''].join(',')
    );
    const csv = header + allRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `finance-report-${year}${month !== 'all' ? '-' + monthNames[month as number] : ''}.csv`;
    link.click();
  };
  
  // Download as PDF (simple print)
  const downloadPDF = () => {
    window.print();
  };
  
  // Year selector (shows years with data)
  const years = [2023, 2024, 2025];
  if (!years.includes(year)) years.push(year);
  years.sort((a, b) => b - a);
  
  // Early return if loading or no data
  if (loading) return <div>Loading reports...</div>;
  if (!transactions || !investments) return <div>No data available</div>;
  
  // Data breakdown for charts
  const incomeData = breakdown(transactions, 'income');
  const expenseData = breakdown(transactions, 'expense');
  const investmentData = breakdown(investments, 'investment');
  
  const monthlyIncome = monthSums(transactions, 'income');
  const monthlyExpense = monthSums(transactions, 'expense');
  
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
      
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <label>
            Year:
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="ml-2 border px-2 py-1 rounded"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
        </label>
        
        <label>
          Month:
          <select
            value={month}
            onChange={e => setMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option value="all">All</option>
            {monthNames.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-green-100 p-3 rounded shadow">
          <div className="text-sm text-green-800">Total Income</div>
          <div className="font-bold">{toCurrency(Object.values(incomeData).reduce((a: number, b: number) => a + b, 0))}</div>
        </div>
        <div className="bg-red-100 p-3 rounded shadow">
          <div className="text-sm text-red-800">Total Expense</div>
          <div className="font-bold">{toCurrency(Object.values(expenseData).reduce((a: number, b: number) => a + b, 0))}</div>
        </div>
        <div className="bg-blue-100 p-3 rounded shadow">
          <div className="text-sm text-blue-800">Total Investments</div>
          <div className="font-bold">{toCurrency(Object.values(investmentData).reduce((a: number, b: number) => a + b, 0))}</div>
        </div>
        <div className="bg-yellow-100 p-3 rounded shadow">
          <div className="text-sm text-yellow-800">Net Savings</div>
          <div className="font-bold">
            {toCurrency(
              Object.values(incomeData).reduce((a: number, b: number) => a + b, 0) -
              Object.values(expenseData).reduce((a: number, b: number) => a + b, 0) -
              Object.values(investmentData).reduce((a: number, b: number) => a + b, 0)
            )}
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <h2 className="font-medium mb-1">Income by Category</h2>
          <Pie
            data={{
              labels: Object.keys(incomeData),
              datasets: [{
                data: Object.values(incomeData),
                backgroundColor: ['#4ade80','#84cc16','#06b6d4','#fde047','#818cf8','#f472b6','#f59e42', '#2dd4bf'],
              }]
            }}
            options={{ plugins: { legend: { display: true, position: 'bottom' } } }}
          />
        </div>
        <div>
          <h2 className="font-medium mb-1">Expense by Category</h2>
          <Pie
            data={{
              labels: Object.keys(expenseData),
              datasets: [{
                data: Object.values(expenseData),
                backgroundColor: ['#fca5a5','#f87171','#ef4444','#eab308','#a3e635','#3b82f6','#06b6d4', '#14b8a6'],
              }]
            }}
            options={{ plugins: { legend: { display: true, position: 'bottom' } } }}
          />
        </div>
        <div>
          <h2 className="font-medium mb-1">Investments by Category</h2>
          <Pie
            data={{
              labels: Object.keys(investmentData),
              datasets: [{
                data: Object.values(investmentData),
                backgroundColor: ['#1e40af','#6366f1','#2563eb','#facc15','#f472b6','#f59e42'],
              }]
            }}
            options={{ plugins: { legend: { display: true, position: 'bottom' } } }}
          />
        </div>
      </div>
      
      {/* Monthly Bar Chart */}
      <div className="bg-white p-4 mb-4 rounded shadow">
        <h2 className="font-medium mb-2">Monthly Trend (Income vs Expense)</h2>
        <Bar
          data={{
            labels: monthNames,
            datasets: [
              {
                label: 'Income',
                data: monthlyIncome,
                backgroundColor: '#86efac'
              },
              {
                label: 'Expense',
                data: monthlyExpense,
                backgroundColor: '#fca5a5'
              }
            ]
          }}
          options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
        />
      </div>
      
      {/* Export Buttons */}
      <div className="flex gap-3">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium" onClick={downloadCSV}>Export as CSV</button>
        <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium" onClick={downloadPDF}>Print or Save as PDF</button>
      </div>
    </div>
  );
};

export default Reports;
