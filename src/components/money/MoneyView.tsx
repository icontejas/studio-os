import React, { useState } from 'react';
import {
  IndianRupee,
  Plus,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  DollarSign,
  Fuel,
  Users,
  Camera,
  Laptop,
  ShoppingBag,
  Car,
  X,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Expense, ExpenseCategory } from '../../types/database';
import { formatINR, formatDate } from '../../lib/formatters';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Fuel',
  'Travel',
  'Assistant',
  'Equipment',
  'Parking',
  'Food',
  'Software',
  'Other'
];

export const MoneyView: React.FC = () => {
  const {
    invoices,
    quotations,
    payments,
    expenses,
    projects,
    totalRevenue,
    totalCollected,
    totalOutstanding,
    addExpense,
    deleteExpense
  } = useData();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Fuel');
  const [expAmount, setExpAmount] = useState<number>(1000);
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expProject, setExpProject] = useState('');

  const totalQuoted = quotations.reduce((acc, q) => acc + q.total, 0);
  const totalAcceptedQuotes = quotations.filter(q => q.status === 'ACCEPTED').reduce((acc, q) => acc + q.total, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalCollected - totalExpenses;
  const profitMargin = totalCollected > 0 ? Math.round((netProfit / totalCollected) * 100) : 0;

  const filteredExpenses = expenses.filter(e => {
    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
    return true;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || expAmount <= 0) return;

    addExpense({
      category: expCategory,
      amount: Number(expAmount),
      expense_date: expDate,
      description: expDesc,
      project_id: expProject || undefined
    });

    setShowAddModal(false);
    setExpDesc('');
    setExpAmount(1000);
  };

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'Fuel': return <Fuel size={15} color="var(--warn)" />;
      case 'Assistant': return <Users size={15} color="var(--accent)" />;
      case 'Equipment': return <Camera size={15} color="#60a5fa" />;
      case 'Software': return <Laptop size={15} color="var(--ok)" />;
      case 'Travel': return <Car size={15} color="var(--text-muted)" />;
      default: return <ShoppingBag size={15} color="var(--text-dim)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Money & Studio Profitability</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Analyze cash pipeline, track production expenses, and understand net studio profitability.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Top Financial Stat Cards */}
      <div className="grid-4">
        <div className="metric-card">
          <div className="metric-label">Total Invoiced</div>
          <div className="metric-value">{formatINR(totalRevenue)}</div>
          <div className="metric-sub">{invoices.length} Bills issued</div>
        </div>

        <div className="metric-card success">
          <div className="metric-label">Collected In Bank</div>
          <div className="metric-value" style={{ color: 'var(--ok)' }}>{formatINR(totalCollected)}</div>
          <div className="metric-sub">{payments.length} Payments cleared</div>
        </div>

        <div className="metric-card danger">
          <div className="metric-label">Production Expenses</div>
          <div className="metric-value" style={{ color: 'var(--danger)' }}>{formatINR(totalExpenses)}</div>
          <div className="metric-sub">Crew, gear, fuel, licenses</div>
        </div>

        <div className="metric-card accent">
          <div className="metric-label">Net Studio Profit</div>
          <div className="metric-value" style={{ color: 'var(--accent)' }}>{formatINR(netProfit)}</div>
          <div className="metric-sub">{profitMargin}% Net Margin</div>
        </div>
      </div>

      {/* Cash Pipeline Funnel */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>Commercial Cash Pipeline</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>From initial quotation to cash in bank</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          <div style={{ background: 'var(--panel2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>1. Total Quoted</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{formatINR(totalQuoted)}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>{quotations.length} Proposals sent</div>
          </div>

          <div style={{ background: 'var(--panel2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: '11px', color: 'var(--warn)', textTransform: 'uppercase', fontWeight: 700 }}>2. Accepted Quotes</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--warn)', marginTop: '4px' }}>{formatINR(totalAcceptedQuotes)}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>Ready to shoot & invoice</div>
          </div>

          <div style={{ background: 'var(--panel2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: '11px', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 700 }}>3. Invoiced</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>{formatINR(totalRevenue)}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>{invoices.length} Bills generated</div>
          </div>

          <div style={{ background: 'var(--panel2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: '11px', color: 'var(--ok)', textTransform: 'uppercase', fontWeight: 700 }}>4. Realized Cash</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ok)', marginTop: '4px' }}>{formatINR(totalCollected)}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>Cleared in bank / UPI</div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>Studio & Project Expenses</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Itemized gear, assistant, travel and fuel logs</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <button
              className={`btn btn-sm ${categoryFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setCategoryFilter('ALL')}
            >
              All ({expenses.length})
            </button>
            {EXPENSE_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Project</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No expenses recorded in this category. Click &quot;Record Expense&quot; to add one.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(e => {
                  const proj = projects.find(p => p.id === e.project_id);
                  return (
                    <tr key={e.id}>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {formatDate(e.expense_date)}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getCategoryIcon(e.category)}
                          <span style={{ fontWeight: 600 }}>{e.category}</span>
                        </div>
                      </td>

                      <td>
                        <span style={{ color: '#fff' }}>{e.description}</span>
                      </td>

                      <td>
                        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          {proj?.title || 'General Studio Overhead'}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '14px' }}>
                          -{formatINR(e.amount)}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-ghost"
                          style={{ padding: '6px' }}
                          onClick={() => deleteExpense(e.id)}
                          title="Delete Expense"
                        >
                          <Trash2 size={14} color="var(--danger)" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ width: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', margin: 0 }}>Record Expense</h2>
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">Expense Category *</label>
                    <select
                      className="select"
                      value={expCategory}
                      onChange={e => setExpCategory(e.target.value as ExpenseCategory)}
                    >
                      {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label className="field-label">Amount (₹) *</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      required
                      value={expAmount}
                      onChange={e => setExpAmount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">Expense Date</label>
                    <input
                      className="input"
                      type="date"
                      value={expDate}
                      onChange={e => setExpDate(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Link to Project (Optional)</label>
                    <select
                      className="select"
                      value={expProject}
                      onChange={e => setExpProject(e.target.value)}
                    >
                      <option value="">General Studio Overhead</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Description / Receipt Note *</label>
                  <input
                    className="input"
                    placeholder="e.g. Gimbal operator crew fee or fuel to shoot location"
                    required
                    value={expDesc}
                    onChange={e => setExpDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
