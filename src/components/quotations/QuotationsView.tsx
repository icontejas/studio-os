import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Printer,
  Share2,
  ArrowRight,
  Receipt,
  X,
  Trash2,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Quotation, QuotationItem } from '../../types/database';
import { formatINR, formatDate, generateWhatsAppLink } from '../../lib/formatters';

interface QuotationsViewProps {
  onNavigateToInvoices: (invoiceId?: string) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({ onNavigateToInvoices }) => {
  const {
    quotations,
    clients,
    projects,
    services,
    packages,
    addClient,
    addQuotation,
    acceptQuotation,
    convertQuotationToInvoice,
    deleteQuotation
  } = useData();
  const { business } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [client_id, setClientId] = useState(clients[0]?.id || '');
  const [inline_client_name, setInlineClientName] = useState('');
  const [inline_client_phone, setInlineClientPhone] = useState('');
  const [project_title, setProjectTitle] = useState('');
  const [valid_until, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [payment_terms, setPaymentTerms] = useState(
    '50% advance booking deposit required to confirm date. Balance due upon delivery of final master cuts.'
  );
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<Omit<QuotationItem, 'id' | 'quotation_id'>>>([
    { description: 'Cinematic Automotive Handover Film (4K)', quantity: 1, rate: 12000, amount: 12000 },
    { description: 'Drone 4K Establishing Shots', quantity: 1, rate: 3000, amount: 3000 }
  ]);

  const filteredQuotes = quotations.filter(q => {
    const client = clients.find(c => c.id === q.client_id);
    return (
      q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
      client?.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const subtotal = items.reduce((acc, it) => acc + (it.amount || 0), 0);
  const discount = 0;
  const tax = 0;
  const total = subtotal - discount + tax;

  const handleAddItem = () => {
    setItems(prev => [...prev, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, val: any) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: val };
      if (field === 'quantity' || field === 'rate') {
        item.amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleApplyPackage = (pkgId: string) => {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;
    setItems([
      {
        description: `${pkg.name} — ${pkg.description || ''}`,
        quantity: 1,
        rate: pkg.price,
        amount: pkg.price
      }
    ]);
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    let targetClientId = client_id;
    if (!targetClientId && inline_client_name) {
      const newC = await addClient({
        name: inline_client_name,
        phone: inline_client_phone || '',
        email: '',
        company: '',
        billing_address: ''
      });
      targetClientId = newC.id;
    }

    if (!targetClientId) {
      alert('Please select or enter client details for this quotation.');
      return;
    }

    const nextQNum = `QT-${100 + quotations.length + 1}`;
    const newQ = await addQuotation({
      client_id: targetClientId,
      quotation_number: nextQNum,
      status: 'SENT',
      subtotal,
      discount,
      tax,
      total,
      valid_until,
      payment_terms,
      notes,
      items: items.map(it => ({
        id: `qi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        quotation_id: '',
        ...it
      }))
    });

    setShowAddModal(false);
    setSelectedQuotation(newQ);
  };

  const handleConvert = async (quotationId: string) => {
    const inv = await convertQuotationToInvoice(quotationId);
    if (inv) {
      setSelectedQuotation(null);
      onNavigateToInvoices(inv.id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Quotations & Estimates</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Build editorial, client-ready proposals, send digital acceptance links, and convert directly to invoices.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            className="input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search quotes by number, client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Quotation #</th>
              <th>Client</th>
              <th>Validity</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No quotations created yet. Click &quot;+ New Quotation&quot; to build one.
                </td>
              </tr>
            ) : (
              filteredQuotes.map(q => {
                const client = clients.find(c => c.id === q.client_id);
                const waLink = generateWhatsAppLink(
                  client?.phone,
                  `Hey ${client?.name || 'there'}, sharing the quotation ${q.quotation_number} (${formatINR(q.total)}) for your upcoming shoot. Please review when free: ${window.location.origin}/portal/${client?.portal_token || ''}`
                );

                return (
                  <tr key={q.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '14px' }}>
                        {q.quotation_number}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        Created {formatDate(q.created_at)}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{client?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{client?.company || 'Individual'}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '13px' }}>Valid until {formatDate(q.valid_until)}</div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>
                        {formatINR(q.total)}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${
                        q.status === 'ACCEPTED' ? 'badge-success' :
                        q.status === 'REJECTED' ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {q.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => setSelectedQuotation(q)}
                        >
                          <FileText size={13} />
                          <span>Preview PDF</span>
                        </button>

                        {q.status === 'SENT' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => acceptQuotation(q.id)}
                            title="Mark as Accepted by Client"
                          >
                            <CheckCircle2 size={13} />
                            <span>Accept</span>
                          </button>
                        )}

                        {q.status === 'ACCEPTED' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleConvert(q.id)}
                            title="Convert Quotation to Invoice"
                          >
                            <Receipt size={13} />
                            <span>Convert to Invoice</span>
                          </button>
                        )}

                        {client?.phone && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-whatsapp btn-sm"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle size={13} />
                          </a>
                        )}

                        <button
                          className="btn btn-sm btn-danger"
                          title="Delete Quotation"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete quotation "${q.quotation_number}"?`)) {
                              deleteQuotation(q.id);
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

      {/* New Quotation Builder Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ width: '820px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', margin: 0 }}>Create Professional Quotation</h2>
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                          value={inline_client_name}
                          onChange={e => setInlineClientName(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label className="field-label">Client Phone</label>
                        <input
                          className="input"
                          placeholder="+91 98765 43210"
                          value={inline_client_phone}
                          onChange={e => setInlineClientPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid-2">
                    <div className="field">
                      <label className="field-label">Select Client *</label>
                      <select
                        className="select"
                        required
                        value={client_id}
                        onChange={e => setClientId(e.target.value)}
                      >
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.company || 'Individual'})</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label className="field-label">Validity Date</label>
                      <input
                        className="input"
                        type="date"
                        value={valid_until}
                        onChange={e => setValidUntil(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {clients.length === 0 && (
                  <div className="field">
                    <label className="field-label">Validity Date</label>
                    <input
                      className="input"
                      type="date"
                      value={valid_until}
                      onChange={e => setValidUntil(e.target.value)}
                    />
                  </div>
                )}

                {/* Quick Package Presets */}
                {packages.length > 0 && (
                  <div style={{ background: 'var(--panel2)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Apply Package Preset
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {packages.map(pkg => (
                        <button
                          key={pkg.id}
                          type="button"
                          className="btn btn-sm btn-ghost"
                          style={{ border: '1px solid var(--line-strong)' }}
                          onClick={() => handleApplyPackage(pkg.id)}
                        >
                          <Sparkles size={12} color="var(--accent)" />
                          <span>{pkg.name} ({formatINR(pkg.price)})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Line Items Table */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="field-label">Services & Line Items</label>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={handleAddItem}>
                      <Plus size={13} /> Add Line Item
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map((item, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr auto', gap: '8px', alignItems: 'center' }}>
                        <input
                          className="input"
                          placeholder="Service description (e.g. 4K Delivery Reel)"
                          required
                          value={item.description}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        />
                        <input
                          className="input"
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        />
                        <input
                          className="input"
                          type="number"
                          placeholder="Rate (₹)"
                          value={item.rate}
                          onChange={e => handleItemChange(idx, 'rate', Number(e.target.value))}
                        />
                        <div style={{ fontWeight: 700, padding: '0 8px', textAlign: 'right' }}>
                          {formatINR(item.amount)}
                        </div>
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ padding: '6px' }}
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 size={15} color="var(--danger)" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Summary */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
                  <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span>Subtotal</span>
                      <span>{formatINR(subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: 'var(--accent)', borderTop: '1px solid var(--line)', paddingTop: '8px' }}>
                      <span>Total</span>
                      <span>{formatINR(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Payment Terms & Conditions</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={payment_terms}
                    onChange={e => setPaymentTerms(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Generate Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* A4 Printable Quotation Preview Modal */}
      {selectedQuotation && (
        <div className="modal-overlay" onClick={() => setSelectedQuotation(null)}>
          <div className="modal-content" style={{ width: '840px', background: '#0b0c0f' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h2 style={{ fontSize: '18px', margin: 0 }}>Quotation Document Preview</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={14} />
                  <span>Print / Save PDF</span>
                </button>
                <button className="btn-ghost" onClick={() => setSelectedQuotation(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: '30px' }}>
              {/* Premium Printable Quotation Sheet */}
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
                    <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>QUOTATION</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {selectedQuotation.quotation_number}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Date: {formatDate(selectedQuotation.created_at)}<br />
                      Valid until: {formatDate(selectedQuotation.valid_until)}
                    </div>
                  </div>
                </div>

                <hr />

                {/* Prepared For Client */}
                <div style={{ margin: '20px 0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Prepared Exclusively For
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {clients.find(c => c.id === selectedQuotation.client_id)?.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    {clients.find(c => c.id === selectedQuotation.client_id)?.company}
                    <br />
                    {clients.find(c => c.id === selectedQuotation.client_id)?.billing_address}
                  </div>
                </div>

                {/* Services Table */}
                <table>
                  <thead>
                    <tr>
                      <th>Service / Scope of Work</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Rate</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedQuotation.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{it.description}</td>
                        <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{formatINR(it.rate)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatINR(it.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total Highlight */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <div style={{ width: '280px', textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>Total Quotation Value</div>
                    <div className="total-highlight">{formatINR(selectedQuotation.total)}</div>
                  </div>
                </div>

                <hr />

                {/* Terms & Payment Information */}
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                  <strong>Payment Terms & Conditions:</strong><br />
                  {selectedQuotation.payment_terms || '50% advance booking deposit required to confirm shoot date.'}
                  <br /><br />
                  <strong>UPI / Bank Transfer:</strong><br />
                  UPI ID: {business.upi_id} · Bank: {business.bank_details?.bank_name} (A/C: {business.bank_details?.account_number}, IFSC: {business.bank_details?.ifsc})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
