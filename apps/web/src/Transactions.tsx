import React, { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  category_id: number;
  subcategory_id?: number;
  user_id: number;
  circle_id: number;
  type: 'income' | 'expense';
}

interface TransactionFormData {
  amount: string;
  description: string;
  date: string;
  category_id: string;
  subcategory_id: string;
}

const Transactions: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    subcategory_id: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch categories and subcategories on component mount
  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  // Filter subcategories based on selected category
  const filteredSubcategories = subcategories.filter(
    sub => sub.category_id === parseInt(formData.category_id)
  );

  const fetchCategories = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories);
      setSubcategories(data.subcategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Mock data for development
      setCategories([
        { id: 1, name: 'Food & Dining', type: 'expense' },
        { id: 2, name: 'Transportation', type: 'expense' },
        { id: 3, name: 'Salary', type: 'income' },
        { id: 4, name: 'Business', type: 'income' }
      ]);
      setSubcategories([
        { id: 1, name: 'Restaurants', category_id: 1 },
        { id: 2, name: 'Groceries', category_id: 1 },
        { id: 3, name: 'Gas', category_id: 2 },
        { id: 4, name: 'Public Transport', category_id: 2 },
        { id: 5, name: 'Main Job', category_id: 3 },
        { id: 6, name: 'Freelance', category_id: 4 }
      ]);
    }
  };

  const fetchTransactions = async () => {
    try {
      // TODO: Replace with actual API call for current month transactions
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const response = await fetch(`/api/transactions?month=${currentMonth}&year=${currentYear}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Mock data for development
      setTransactions([
        {
          id: 1,
          amount: 50.00,
          description: 'Lunch at restaurant',
          date: '2025-08-15',
          category_id: 1,
          subcategory_id: 1,
          user_id: 1,
          circle_id: 1,
          type: 'expense'
        },
        {
          id: 2,
          amount: 3000.00,
          description: 'Monthly salary',
          date: '2025-08-01',
          category_id: 3,
          subcategory_id: 5,
          user_id: 1,
          circle_id: 1,
          type: 'income'
        }
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset subcategory when category changes
      ...(name === 'category_id' && { subcategory_id: '' })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category_id) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const selectedCategory = categories.find(cat => cat.id === parseInt(formData.category_id));
      const transactionData = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        category_id: parseInt(formData.category_id),
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
        type: selectedCategory?.type || 'expense'
      };

      // TODO: Replace with actual API call
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });

      if (response.ok) {
        // Reset form and refresh transactions
        setFormData({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          category_id: '',
          subcategory_id: ''
        });
        fetchTransactions();
      } else {
        throw new Error('Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error creating transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const getSubcategoryName = (subcategoryId?: number) => {
    if (!subcategoryId) return '';
    return subcategories.find(sub => sub.id === subcategoryId)?.name || 'Unknown';
  };

  return (
    <div className="transactions">
      <h1>Transactions</h1>
      
      {/* Transaction Form */}
      <div className="transaction-form">
        <h2>Add New Transaction</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter transaction description"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category_id">Category *</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.type})
                </option>
              ))}
            </select>
          </div>

          {formData.category_id && filteredSubcategories.length > 0 && (
            <div className="form-group">
              <label htmlFor="subcategory_id">Subcategory</label>
              <select
                id="subcategory_id"
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleInputChange}
              >
                <option value="">Select a subcategory (optional)</option>
                {filteredSubcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>

      {/* Transactions List */}
      <div className="transactions-list">
        <h2>This Month's Transactions</h2>
        {transactions.length === 0 ? (
          <p>No transactions found for this month.</p>
        ) : (
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.description}</td>
                    <td>{getCategoryName(transaction.category_id)}</td>
                    <td>{getSubcategoryName(transaction.subcategory_id)}</td>
                    <td className={`amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </td>
                    <td>
                      <span className={`type-badge ${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .transactions {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .transaction-form {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        button {
          background: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        button:hover {
          background: #0056b3;
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .transactions-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        th {
          background: #f5f5f5;
          font-weight: bold;
        }

        .amount.income {
          color: #28a745;
          font-weight: bold;
        }

        .amount.expense {
          color: #dc3545;
          font-weight: bold;
        }

        .type-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .type-badge.income {
          background: #d4edda;
          color: #155724;
        }

        .type-badge.expense {
          background: #f8d7da;
          color: #721c24;
        }
      `}</style>
    </div>
  );
};

export default Transactions;
