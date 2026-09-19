import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  MessageCircle,
  CreditCard,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Invoice, Payment, PaymentMethod } from '../../types/database';
import { formatINR, formatDate, generateWhatsAppLink } from '../../lib/formatters';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    clients,
    payments,
    addClient,
    addInvoice,
    recordPayment,
    deleteInvoice
  } = useData();
  const { business } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Payment Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  // Invoice Form State
  const [newInvClient, setNewInvClient] = useState(clients[0]?.id || '');
  const [newInvInlineClientName, setNewInvInlineClientName] = useState('');
  const [newInvInlineClientPhone, setNewInvInlineClientPhone] = useState('');
  const [newInvDueDate, setNewInvDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newInvDesc, setNewInvDesc] = useState('Cinematic Production Services');
  const [newInvAmount, setNewInvAmount] = useState<number>(15000);
  const [newInvTerms, setNewInvTerms] = useState('Payment due within 7 days of invoice date.');

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    const client = clients.find(c => c.id === inv.client_id);
    return (
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      client?.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleOpenRecordPayment = (inv: Invoice) => {
    setPaymentModalInvoice(inv);
    setPayAmount(inv.balance);
    setPayRef(`UPI/${new Date().toISOString().slice(2, 10).replace(/-/g, '')}/${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice || payAmount <= 0) return;

    recordPayment({
      invoice_id: paymentModalInvoice.id,
      client_id: paymentModalInvoice.client_id,
      amount: Number(payAmount),
      payment_date: payDate,
      payment_method: payMethod,
      reference: payRef,
      notes: payNotes
    });

    setPaymentModalInvoice(null);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newInvAmount <= 0) return;

    let targetClientId = newInvClient;
    if (!targetClientId && newInvInlineClientName) {
      const newC = await addClient({
        name: newInvInlineClientName,
        phone: newInvInlineClientPhone || '',
        email: '',
        company: '',
        billing_address: ''
      });
      targetClientId = newC.id;
    }

    if (!targetClientId) {
      alert('Please select or specify a client for this invoice.');
      return;
    }

    const nextInvNum = `INV-${100 + invoices.length + 1}`;
    addInvoice({
      client_id: targetClientId,
      invoice_number: nextInvNum,
      status: 'SENT',
      subtotal: newInvAmount,
      discount: 0,
      tax: 0,
      total: newInvAmount,
      paid_amount: 0,
      balance: newInvAmount,
      due_date: newInvDueDate,
      payment_terms: newInvTerms,
      items: [
        {
          id: `ii-${Date.now()}`,
          invoice_id: '',
          description: newInvDesc,
          quantity: 1,
          rate: newInvAmount,
          amount: newInvAmount
        }
      ]
    });

    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Invoices & Payment Records</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Track client bills, record partial and full payments, calculate live balances and issue PDF invoices.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '420px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            className="input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by invoice number or client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'].map(st => (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Total Value</th>
              <th>Paid Amount</th>
              <th>Balance Due</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No invoices found. Click &quot;+ New Invoice&quot; or convert an accepted quotation.
                </td>
              </tr>
            ) : (
              filteredInvoices.map(inv => {
                const client = clients.find(c => c.id === inv.client_id);
                const isOverdue = inv.status === 'OVERDUE' || (new Date(inv.due_date) < new Date() && inv.balance > 0);
                const waLink = generateWhatsAppLink(
                  client?.phone,
                  `Hey ${client?.name || 'there'}, just a friendly reminder regarding the pending ${formatINR(inv.balance)} balance for ${inv.invoice_number}. Please let me know once processed. Thanks!`
                );

                return (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '14px' }}>
                        {inv.invoice_number}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        Created {formatDate(inv.created_at)}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{client?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{client?.company || 'Individual'}</div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>
                        {formatINR(inv.total)}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--ok)' }}>
                        {formatINR(inv.paid_amount)}
                      </span>
                    </td>

                    <td>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '15px',
                        color: inv.balance > 0 ? (isOverdue ? 'var(--danger)' : 'var(--warn)') : 'var(--ok)'
                      }}>
                        {formatINR(inv.balance)}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '13px', color: isOverdue ? 'var(--danger)' : 'var(--text)' }}>
                        {formatDate(inv.due_date)}
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${
                        inv.status === 'PAID' ? 'badge-success' :
                        isOverdue ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {isOverdue && inv.status !== 'PAID' ? 'OVERDUE' : inv.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <Receipt size={13} />
                          <span>View PDF</span>
                        </button>

                        {inv.balance > 0 && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleOpenRecordPayment(inv)}
                          >
                            <DollarSign size={13} />
                            <span>Record Payment</span>
                          </button>
                        )}

                        {client?.phone && inv.balance > 0 && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-whatsapp btn-sm"
                            title="Send WhatsApp Payment Reminder"
                          >
                            <MessageCircle size={13} />
                          </a>
                        )}

                        <button
                          className="btn btn-sm btn-danger"
                          title="Delete Invoice"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete invoice "${inv.invoice_number}"?`)) {
                              deleteInvoice(inv.id);
                            }
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="modal-overlay" onClick={() => setPaymentModalInvoice(null)}>
          <div className="modal-content" style={{ width: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '18px', margin: 0 }}>Record Client Payment</h2>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  {paymentModalInvoice.invoice_number} · Total {formatINR(paymentModalInvoice.total)} (Balance: {formatINR(paymentModalInvoice.balance)})
                </div>
              </div>
              <button className="btn-ghost" onClick={() => setPaymentModalInvoice(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePayment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">Payment Amount (₹) *</label>
                    <input
                      className="input"
                      type="number"
                      max={paymentModalInvoice.balance}
                      min="1"
                      required
                      value={payAmount}
                      onChange={e => setPayAmount(Number(e.target.value))}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Payment Method *</label>
                    <select
                      className="select"
                      value={payMethod}
                      onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                    >
                      <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                      <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS/RTGS)</option>
                      <option value="CASH">Cash</option>
                      <option value="CARD">Debit / Credit Card</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">Payment Date</label>
                    <input
                      className="input"
                      type="date"
                      value={payDate}
                      onChange={e => setPayDate(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">UTR / Reference No.</label>
                    <input
                      className="input"
                      placeholder="e.g. UPI/260918/998812"
                      value={payRef}
                      onChange={e => setPayRef(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Payment Notes</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    placeholder="e.g. Received 50% milestone advance via GPay..."
                    value={payNotes}
                    onChange={e => setPayNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setPaymentModalInvoice(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ width: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', margin: 0 }}>Create New Invoice</h2>
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {clients.length === 0 ? (
                  <div style={{ background: 'var(--panel2)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>
                      No clients exist yet. Enter client details below:
                    </div>
                    <div className="grid-2">
                      <div className="field">
                        <label className="field-label">Client Name *</label>
                        <input
                          className="input"
                          placeholder="e.g. BMW Motors Nagpur"
                          required
                          value={newInvInlineClientName}
                          onChange={e => setNewInvInlineClientName(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label className="field-label">Client Phone</label>
                        <input
                          className="input"
                          placeholder="+91 98765 43210"
                          value={newInvInlineClientPhone}
                          onChange={e => setNewInvInlineClientPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid-2">
                    <div className="field">
                      <label className="field-label">Client *</label>
                      <select
                        className="select"
                        required
                        value={newInvClient}
                        onChange={e => setNewInvClient(e.target.value)}
                      >
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.company || 'Individual'})</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label className="field-label">Due Date *</label>
                      <input
                        className="input"
                        type="date"
                        required
                        value={newInvDueDate}
                        onChange={e => setNewInvDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {clients.length === 0 && (
                  <div className="field">
                    <label className="field-label">Due Date *</label>
                    <input
                      className="input"
                      type="date"
                      required
                      value={newInvDueDate}
                      onChange={e => setNewInvDueDate(e.target.value)}
                    />
                  </div>
                )}

                <div className="field">
                  <label className="field-label">Service Description</label>
                  <input
                    className="input"
                    placeholder="e.g. BMW X5 Handover Cinematography & Reels"
                    required
                    value={newInvDesc}
                    onChange={e => setNewInvDesc(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="field-label">Total Amount (₹) *</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    required
                    value={newInvAmount}
                    onChange={e => setNewInvAmount(Number(e.target.value))}
                  />
                </div>

                <div className="field">
                  <label className="field-label">Payment Terms</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={newInvTerms}
                    onChange={e => setNewInvTerms(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* A4 Printable Invoice View Modal */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content" style={{ width: '840px', background: '#0b0c0f' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h2 style={{ fontSize: '18px', margin: 0 }}>Invoice Document Preview</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={14} />
                  <span>Print / Save PDF</span>
                </button>
                <button className="btn-ghost" onClick={() => setSelectedInvoice(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: '30px' }}>
              <div className="printable-doc">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="doc-brand">{business.brand_name}</div>
                    <div className="doc-tagline">{business.tagline}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                      {business.address}<br />
                      Phone: {business.phone} · Email: {business.email}
                      {business.gstin && <><br />GSTIN: {business.gstin}</>}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>TAX INVOICE</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {selectedInvoice.invoice_number}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Date: {formatDate(selectedInvoice.created_at)}<br />
                      <strong>Due Date: {formatDate(selectedInvoice.due_date)}</strong>
                    </div>
                  </div>
                </div>

                <hr />

                {/* Billed To */}
                <div style={{ margin: '20px 0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Billed To
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {clients.find(c => c.id === selectedInvoice.client_id)?.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {clients.find(c => c.id === selectedInvoice.client_id)?.company}
                    <br />
                    {clients.find(c => c.id === selectedInvoice.client_id)?.billing_address}
                    {clients.find(c => c.id === selectedInvoice.client_id)?.gstin && (
                      <div>Client GSTIN: {clients.find(c => c.id === selectedInvoice.client_id)?.gstin}</div>
                    )}
                  </div>
                </div>

                {/* Services Table */}
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Rate</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedInvoice.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{it.description}</td>
                        <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{formatINR(it.rate)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatINR(it.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                      <span>Invoice Total</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatINR(selectedInvoice.total)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16a34a' }}>
                      <span>Amount Paid</span>
                      <span style={{ fontWeight: 700 }}>-{formatINR(selectedInvoice.paid_amount)}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '18px',
                      fontWeight: 800,
                      color: selectedInvoice.balance > 0 ? '#dc2626' : '#16a34a',
                      borderTop: '2px solid #e2e8f0',
                      paddingTop: '8px'
                    }}>
                      <span>Balance Due</span>
                      <span>{formatINR(selectedInvoice.balance)}</span>
                    </div>
                  </div>
                </div>

                <hr />

                {/* Bank / UPI Payment Transfer Details */}
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                  <strong>Payment Instructions:</strong><br />
                  Please transfer the balance amount using UPI or Bank details below:<br />
                  <strong>UPI ID:</strong> {business.upi_id}<br />
                  <strong>Bank:</strong> {business.bank_details?.bank_name} · <strong>A/C:</strong> {business.bank_details?.account_number} · <strong>IFSC:</strong> {business.bank_details?.ifsc}<br />
                  <strong>Account Holder:</strong> {business.bank_details?.account_holder}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
