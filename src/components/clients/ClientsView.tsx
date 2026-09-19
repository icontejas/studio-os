import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building2,
  ExternalLink,
  MessageCircle,
  MoreVertical,
  X,
  FileText,
  Receipt,
  Film,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Client } from '../../types/database';
import { formatINR, generateWhatsAppLink } from '../../lib/formatters';

interface ClientsViewProps {
  onOpenClientPortal: (token: string) => void;
  onNavigate: (page: string, id?: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onOpenClientPortal,
  onNavigate
}) => {
  const { clients, projects, invoices, quotations, addClient, updateClient, deleteClient } = useData();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    billing_address: '',
    gstin: '',
    notes: ''
  });

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const newC = await addClient(formData);
    setShowAddModal(false);
    setFormData({ name: '', phone: '', email: '', company: '', billing_address: '', gstin: '', notes: '' });
    setSelectedClient(newC);
  };

  const copyPortalLink = (client: Client) => {
    const portalUrl = `${window.location.origin}/portal/${client.portal_token}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedToken(client.id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Client CRM</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Manage client relationships, billing details, projects and client portal links.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>New Client</span>
        </button>
      </div>

      {/* Search & Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '450px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            className="input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search clients by name, company, phone, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
        </span>
      </div>

      {/* Clients Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Company & GSTIN</th>
              <th>Contact Details</th>
              <th>Projects</th>
              <th>Outstanding</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No clients found. Click &quot;+ New Client&quot; to add your first client.
                </td>
              </tr>
            ) : (
              filteredClients.map(c => {
                const clientProjects = projects.filter(p => p.client_id === c.id);
                const clientInvoices = invoices.filter(inv => inv.client_id === c.id);
                const outstanding = clientInvoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);
                const waLink = generateWhatsAppLink(c.phone, `Hey ${c.name}, hope you are doing well!`);

                return (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedClient(c)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--panel2)',
                          border: '1px solid var(--line-strong)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: 'var(--accent)'
                        }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{c.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Token: {c.portal_token.substring(0, 14)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div>{c.company || '—'}</div>
                      {c.gstin && (
                        <span className="badge badge-neutral" style={{ fontSize: '10.5px', marginTop: '3px' }}>
                          GST: {c.gstin}
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={12} color="var(--text-dim)" />
                        <span>{c.phone || '—'}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Mail size={12} color="var(--text-dim)" />
                        <span>{c.email || '—'}</span>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-neutral">
                        {clientProjects.length} {clientProjects.length === 1 ? 'Project' : 'Projects'}
                      </span>
                    </td>

                    <td>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '14px',
                        color: outstanding > 0 ? 'var(--danger)' : 'var(--ok)'
                      }}>
                        {formatINR(outstanding)}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn btn-sm"
                          title="Copy Client Portal Link"
                          onClick={() => copyPortalLink(c)}
                        >
                          {copiedToken === c.id ? <Check size={13} color="var(--ok)" /> : <Copy size={13} />}
                          <span>{copiedToken === c.id ? 'Copied' : 'Portal Link'}</span>
                        </button>

                        <button
                          className="btn btn-sm"
                          style={{ color: 'var(--accent)' }}
                          title="Open Client Portal View"
                          onClick={() => onOpenClientPortal(c.portal_token)}
                        >
                          <ExternalLink size={13} />
                        </button>

                        {c.phone && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-whatsapp btn-sm"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={13} />
                          </a>
                        )}

                        <button
                          className="btn btn-sm btn-danger"
                          title="Delete Client"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete client "${c.name}" and their associated records?`)) {
                              deleteClient(c.id);
                              if (selectedClient?.id === c.id) setSelectedClient(null);
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

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', margin: 0 }}>Add New Client</h2>
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateClient}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">Client Name *</label>
                    <input
                      className="input"
                      placeholder="e.g. Rahul Sharma"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">Company / Brand Name</label>
                    <input
                      className="input"
                      placeholder="e.g. BMW Delhi or Individual"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">Phone (WhatsApp) *</label>
                    <input
                      className="input"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">Email Address</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="client@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">GSTIN (Optional)</label>
                    <input
                      className="input"
                      placeholder="07AAAAA0000A1Z5"
                      value={formData.gstin}
                      onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">Billing Address</label>
                    <input
                      className="input"
                      placeholder="DLF Phase 5, Gurgaon, Haryana"
                      value={formData.billing_address}
                      onChange={e => setFormData({ ...formData, billing_address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Client Preferences & Notes</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    placeholder="e.g. Prefers cinematic teaser reels, warm grading, 4K deliveries..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Detail Drawer */}
      {selectedClient && (
        <div className="drawer-overlay" onClick={() => setSelectedClient(null)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="badge badge-accent" style={{ marginBottom: '8px' }}>Client Profile</div>
                <h2 style={{ fontSize: '24px', margin: 0 }}>{selectedClient.name}</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedClient.company || 'Individual Client'}
                </div>
              </div>
              <button className="btn-ghost" onClick={() => setSelectedClient(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Portal Link Box */}
            <div style={{
              background: 'var(--panel2)',
              border: '1px solid var(--line-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              margin: '20px 0'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                Client Portal Link
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 10px' }}>
                Clients can view projects, approve quotations, download deliverables and review invoices via this link:
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="input"
                  readOnly
                  style={{ fontSize: '12px', background: 'var(--bg)' }}
                  value={`${window.location.origin}/portal/${selectedClient.portal_token}`}
                />
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => copyPortalLink(selectedClient)}
                >
                  {copiedToken === selectedClient.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => onOpenClientPortal(selectedClient.portal_token)}
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>

            {/* Contact Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone</span>
                <span style={{ fontWeight: 600 }}>{selectedClient.phone || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email</span>
                <span style={{ fontWeight: 600 }}>{selectedClient.email || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>GSTIN</span>
                <span style={{ fontWeight: 600 }}>{selectedClient.gstin || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Billing Address</span>
                <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '240px' }}>{selectedClient.billing_address || '—'}</span>
              </div>
            </div>

            {/* Associated Projects */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Projects</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {projects.filter(p => p.client_id === selectedClient.id).map(p => (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedClient(null); onNavigate('projects', p.id); }}
                    style={{
                      background: 'var(--panel2)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#fff' }}>{p.title}</div>
                      <span className="badge badge-accent" style={{ fontSize: '10.5px', marginTop: '3px' }}>{p.status}</span>
                    </div>
                    <div style={{ fontWeight: 800 }}>{formatINR(p.total_amount)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Associated Invoices */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Invoices</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {invoices.filter(inv => inv.client_id === selectedClient.id).map(inv => (
                  <div
                    key={inv.id}
                    onClick={() => { setSelectedClient(null); onNavigate('invoices', inv.id); }}
                    style={{
                      background: 'var(--panel2)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#fff' }}>{inv.invoice_number}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Due {inv.due_date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800 }}>{formatINR(inv.total)}</div>
                      {inv.balance > 0 && <span style={{ color: 'var(--danger)', fontSize: '11px' }}>{formatINR(inv.balance)} due</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone: Delete Client */}
            <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
              <button
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete client "${selectedClient.name}" and all their history?`)) {
                    deleteClient(selectedClient.id);
                    setSelectedClient(null);
                  }
                }}
              >
                <Trash2 size={15} />
                <span>Delete Client Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
