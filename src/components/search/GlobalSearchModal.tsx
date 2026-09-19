import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Film, FileText, Receipt, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../lib/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { clients, projects, quotations, invoices } = useData();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate('search');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingClients = q ? clients.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.company?.toLowerCase().includes(q) ||
    c.phone?.includes(q) ||
    c.email?.toLowerCase().includes(q)
  ) : [];

  const matchingProjects = q ? projects.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.location?.toLowerCase().includes(q) ||
    clients.find(c => c.id === p.client_id)?.name.toLowerCase().includes(q)
  ) : [];

  const matchingQuotations = q ? quotations.filter(quot =>
    quot.quotation_number.toLowerCase().includes(q) ||
    clients.find(c => c.id === quot.client_id)?.name.toLowerCase().includes(q)
  ) : [];

  const matchingInvoices = q ? invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(q) ||
    clients.find(c => c.id === inv.client_id)?.name.toLowerCase().includes(q)
  ) : [];

  const totalResults =
    matchingClients.length +
    matchingProjects.length +
    matchingQuotations.length +
    matchingInvoices.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: '640px', padding: 0, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--panel2)'
        }}>
          <Search size={18} color="var(--accent)" />
          <input
            ref={inputRef}
            className="input"
            style={{
              background: 'transparent',
              border: 0,
              padding: 0,
              fontSize: '16px',
              boxShadow: 'none'
            }}
            placeholder="Search clients, projects, quotes, invoices, phone numbers..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="btn-ghost" style={{ padding: '4px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Search Results */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px' }}>
          {!q ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Quick Global Search</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Type a client name (e.g. &quot;Rahul&quot;), invoice &quot;INV-104&quot;, quotation &quot;QT-104&quot;, or phone number.
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No matching records found for &quot;{query}&quot;.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Clients */}
              {matchingClients.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 8px' }}>
                    Clients ({matchingClients.length})
                  </div>
                  {matchingClients.map(c => (
                    <div
                      key={c.id}
                      onClick={() => { onClose(); onNavigate('clients', c.id); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--panel2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={16} color="var(--ok)" />
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff' }}>{c.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.company || c.phone}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--text-dim)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {matchingProjects.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 8px' }}>
                    Projects ({matchingProjects.length})
                  </div>
                  {matchingProjects.map(p => {
                    const cl = clients.find(c => c.id === p.client_id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => { onClose(); onNavigate('projects', p.id); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--panel2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Film size={16} color="var(--accent)" />
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff' }}>{p.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cl?.name} · {p.status}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700 }}>{formatINR(p.total_amount)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quotations */}
              {matchingQuotations.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 8px' }}>
                    Quotations ({matchingQuotations.length})
                  </div>
                  {matchingQuotations.map(qItem => {
                    const cl = clients.find(c => c.id === qItem.client_id);
                    return (
                      <div
                        key={qItem.id}
                        onClick={() => { onClose(); onNavigate('quotations', qItem.id); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--panel2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={16} color="var(--warn)" />
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff' }}>{qItem.quotation_number}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cl?.name} · {qItem.status}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
                          {formatINR(qItem.total)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Invoices */}
              {matchingInvoices.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '4px 8px' }}>
                    Invoices ({matchingInvoices.length})
                  </div>
                  {matchingInvoices.map(inv => {
                    const cl = clients.find(c => c.id === inv.client_id);
                    return (
                      <div
                        key={inv.id}
                        onClick={() => { onClose(); onNavigate('invoices', inv.id); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--panel2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Receipt size={16} color="#60a5fa" />
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff' }}>{inv.invoice_number}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cl?.name} · {inv.status}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700 }}>{formatINR(inv.total)}</div>
                          {inv.balance > 0 && (
                            <div style={{ fontSize: '11px', color: 'var(--danger)' }}>{formatINR(inv.balance)} due</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
