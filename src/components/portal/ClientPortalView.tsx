import React, { useState } from 'react';
import {
  Film,
  FileText,
  Receipt,
  Download,
  Play,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Sparkles,
  ArrowLeft,
  Clock,
  MapPin,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR, formatDate, getStatusBadgeClass } from '../../lib/formatters';

interface ClientPortalViewProps {
  token: string;
  onExitPortal?: () => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  token,
  onExitPortal
}) => {
  const {
    clients,
    projects,
    quotations,
    invoices,
    deliverables,
    messages,
    acceptQuotation,
    requestDeliverableRevision,
    updateDeliverableStatus,
    addMessage
  } = useData();
  const { business } = useAuth();

  // Find client by token
  const currentClient = clients.find(c => c.portal_token === token) || clients[0];

  const [activeTab, setActiveTab] = useState<'projects' | 'quotations' | 'invoices' | 'deliverables' | 'chat'>('projects');
  const [selectedDeliverableForRevision, setSelectedDeliverableForRevision] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  if (!currentClient) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0c0f', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Invalid or Expired Client Portal Link</h2>
          <p style={{ color: 'var(--text-muted)' }}>Please contact the studio to receive an updated link.</p>
          {onExitPortal && (
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={onExitPortal}>
              Back to StudioOS
            </button>
          )}
        </div>
      </div>
    );
  }

  const clientProjects = projects.filter(p => p.client_id === currentClient.id);
  const clientQuotations = quotations.filter(q => q.client_id === currentClient.id);
  const clientInvoices = invoices.filter(inv => inv.client_id === currentClient.id);
  const clientDeliverables = deliverables.filter(d =>
    clientProjects.some(p => p.id === d.project_id)
  );
  const primaryProject = clientProjects[0];
  const projectMessages = messages.filter(m => m.project_id === primaryProject?.id);

  const totalOutstanding = clientInvoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);
  const pendingReviewCount = clientDeliverables.filter(d => d.status === 'READY_FOR_REVIEW').length;

  const handleAcceptQuote = (qId: string) => {
    acceptQuotation(qId);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const handleSubmitRevision = (delId: string) => {
    if (!revisionNotes.trim()) return;
    requestDeliverableRevision(delId, revisionNotes);
    setSelectedDeliverableForRevision(null);
    setRevisionNotes('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !primaryProject) return;

    addMessage({
      project_id: primaryProject.id,
      sender_type: 'client',
      sender_name: currentClient.name,
      message: chatInput.trim()
    });

    setChatInput('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090a0d', color: '#f5f6f9' }}>
      {/* Top Client Portal Navigation Bar */}
      <header style={{
        background: '#101217',
        borderBottom: '1px solid var(--line)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff' }}>
              {business.brand_name} <span style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>PORTAL</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              {business.tagline}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{currentClient.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentClient.company || 'Client Access'}</div>
            </div>

            {onExitPortal && (
              <button className="btn btn-sm btn-ghost" onClick={onExitPortal} style={{ border: '1px solid var(--line)' }}>
                <ArrowLeft size={13} />
                <span>Exit Portal</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Portal Body */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #151821 0%, #1a1e2a 100%)',
          border: '1px solid var(--line-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          marginBottom: '28px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Client Workspace
          </div>
          <h1 style={{ fontSize: '28px', margin: '6px 0 10px' }}>
            Welcome, {currentClient.name.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '650px' }}>
            Track real-time production status, review and approve cinematic video cuts, download assets and view invoice statements.
          </p>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '20px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Projects</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{clientProjects.length}</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deliverables Ready</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: pendingReviewCount > 0 ? 'var(--accent)' : '#fff', marginTop: '2px' }}>
                {clientDeliverables.length} ({pendingReviewCount} in review)
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending Balance</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: totalOutstanding > 0 ? 'var(--warn)' : 'var(--ok)', marginTop: '2px' }}>
                {formatINR(totalOutstanding)}
              </div>
            </div>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
          <button
            className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('projects')}
          >
            <Film size={15} />
            <span>Projects & Status</span>
          </button>

          <button
            className={`btn ${activeTab === 'deliverables' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('deliverables')}
          >
            <Play size={15} />
            <span>Video & Photos ({clientDeliverables.length})</span>
          </button>

          <button
            className={`btn ${activeTab === 'quotations' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('quotations')}
          >
            <FileText size={15} />
            <span>Quotations ({clientQuotations.length})</span>
          </button>

          <button
            className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('invoices')}
          >
            <Receipt size={15} />
            <span>Invoices & Bills ({clientInvoices.length})</span>
          </button>

          <button
            className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={15} />
            <span>Studio Chat</span>
          </button>
        </div>

        {/* Tab 1: Projects & Timeline */}
        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {clientProjects.map(proj => {
              const stages = ['BOOKED', 'SHOOTING', 'EDITING', 'REVIEW', 'DELIVERED'];
              const currentIdx = stages.indexOf(proj.status);

              return (
                <div key={proj.id} className="card" style={{ padding: '26px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span className={`badge ${getStatusBadgeClass(proj.status)}`} style={{ marginBottom: '8px' }}>
                        {proj.status}
                      </span>
                      <h2 style={{ fontSize: '22px', margin: 0 }}>{proj.title}</h2>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {proj.description || 'Commercial cinematography production'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Shoot Date</div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{formatDate(proj.shoot_date)} at {proj.start_time || '11:00 AM'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>{proj.location}</div>
                    </div>
                  </div>

                  {/* Visual Progress Timeline */}
                  <div style={{ margin: '30px 0 10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                      {stages.map((stage, idx) => {
                        const isDone = currentIdx >= idx;
                        const isCurrent = currentIdx === idx;

                        return (
                          <div key={stage} style={{ textAlign: 'center' }}>
                            <div style={{
                              height: '4px',
                              borderRadius: '4px',
                              background: isDone ? 'var(--accent)' : 'var(--line)',
                              marginBottom: '10px'
                            }} />
                            <div style={{
                              fontSize: '11px',
                              fontWeight: isCurrent ? 800 : 600,
                              color: isCurrent ? 'var(--accent)' : (isDone ? '#fff' : 'var(--text-dim)')
                            }}>
                              {stage}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Deliverables & Video Approvals */}
        {activeTab === 'deliverables' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid-2">
              {clientDeliverables.map(del => (
                <div key={del.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className={`badge ${getStatusBadgeClass(del.status)}`}>
                        {del.status.replace(/_/g, ' ')}
                      </span>
                      <h3 style={{ fontSize: '18px', margin: '6px 0 2px' }}>{del.name}</h3>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{del.type} · 4K UHD Master</div>
                    </div>
                  </div>

                  {/* Video Preview Embed */}
                  {del.preview_url && (
                    <div style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: '#000',
                      border: '1px solid var(--line)'
                    }}>
                      <video
                        src={del.preview_url}
                        controls
                        style={{ width: '100%', maxHeight: '240px', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {del.notes && (
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      <strong>Director Note:</strong> {del.notes}
                    </div>
                  )}

                  {del.revision_notes && (
                    <div style={{ fontSize: '12.5px', color: 'var(--danger)', background: 'var(--danger-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                      <strong>Your Revision Request:</strong> {del.revision_notes}
                    </div>
                  )}

                  {/* Approval Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                    {del.status !== 'APPROVED' && (
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => {
                          updateDeliverableStatus(del.id, 'APPROVED');
                          try { confetti({ particleCount: 60, spread: 60 }); } catch {}
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve Cut</span>
                      </button>
                    )}

                    {del.status !== 'APPROVED' && (
                      <button
                        className="btn btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => setSelectedDeliverableForRevision(del.id)}
                      >
                        <AlertCircle size={14} />
                        <span>Request Changes</span>
                      </button>
                    )}

                    {del.file_url && (
                      <a href={del.file_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost">
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Revision Request Dialog */}
            {selectedDeliverableForRevision && (
              <div className="modal-overlay" onClick={() => setSelectedDeliverableForRevision(null)}>
                <div className="modal-content" style={{ width: '520px' }} onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2 style={{ fontSize: '18px', margin: 0 }}>Request Video / Photo Changes</h2>
                  </div>
                  <div className="modal-body">
                    <label className="field-label">What adjustments would you like made?</label>
                    <textarea
                      className="textarea"
                      rows={4}
                      style={{ marginTop: '8px' }}
                      placeholder="e.g. Please extend the drone shot by 2 seconds, slightly brighten the night driving footage..."
                      value={revisionNotes}
                      onChange={e => setRevisionNotes(e.target.value)}
                    />
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={() => setSelectedDeliverableForRevision(null)}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSubmitRevision(selectedDeliverableForRevision)}
                    >
                      Submit Feedback to Studio
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Quotations */}
        {activeTab === 'quotations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {clientQuotations.map(q => (
              <div key={q.id} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <span className={`badge ${q.status === 'ACCEPTED' ? 'badge-success' : 'badge-warning'}`}>
                      {q.status}
                    </span>
                    <h2 style={{ fontSize: '20px', margin: '6px 0 2px' }}>{q.quotation_number}</h2>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Valid until {formatDate(q.valid_until)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Quotation Total</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent)' }}>
                      {formatINR(q.total)}
                    </div>
                  </div>
                </div>

                {/* Line items */}
                <div style={{ margin: '20px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '14px 0' }}>
                  {(q.items || []).map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', padding: '6px 0' }}>
                      <span>{it.description} (x{it.quantity})</span>
                      <span style={{ fontWeight: 700 }}>{formatINR(it.amount)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <strong>Payment Terms:</strong> {q.payment_terms}
                </div>

                {q.status !== 'ACCEPTED' ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAcceptQuote(q.id)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Accept Quotation & Confirm Booking</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ok)', fontWeight: 700, fontSize: '14px' }}>
                    <CheckCircle2 size={18} />
                    <span>Quotation Accepted on {formatDate(q.accepted_at || q.updated_at)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Invoices & Payment */}
        {activeTab === 'invoices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {clientInvoices.map(inv => (
              <div key={inv.id} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : 'badge-danger'}`}>
                      {inv.status}
                    </span>
                    <h2 style={{ fontSize: '20px', margin: '6px 0 2px' }}>{inv.invoice_number}</h2>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Due Date: {formatDate(inv.due_date)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Balance Remaining</div>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: inv.balance > 0 ? 'var(--danger)' : 'var(--ok)' }}>
                      {formatINR(inv.balance)}
                    </div>
                  </div>
                </div>

                <div style={{ margin: '20px 0', borderTop: '1px solid var(--line)', paddingTop: '14px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Total Billed</span>
                    <span>{formatINR(inv.total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ok)' }}>
                    <span>Paid to Date</span>
                    <span>-{formatINR(inv.paid_amount)}</span>
                  </div>
                </div>

                {inv.balance > 0 && (
                  <div style={{ background: 'var(--panel2)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>Direct UPI / Bank Transfer Details:</div>
                    <div>UPI ID: <strong>{business.upi_id}</strong></div>
                    <div>Bank: <strong>{business.bank_details?.bank_name}</strong> · A/C: <strong>{business.bank_details?.account_number}</strong> · IFSC: <strong>{business.bank_details?.ifsc}</strong></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Direct Studio Chat */}
        {activeTab === 'chat' && (
          <div className="card" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Project Communication</h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chat directly with Tejas & creative crew</div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', marginBottom: '16px' }}>
              {projectMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No messages yet. Send a note to the studio below!
                </div>
              ) : (
                projectMessages.map(m => {
                  const isMe = m.sender_type === 'client';
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        background: isMe ? 'var(--panel2)' : 'rgba(217, 255, 98, 0.1)',
                        border: isMe ? '1px solid var(--line)' : '1px solid rgba(217, 255, 98, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        maxWidth: '75%'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: isMe ? 'var(--text-muted)' : 'var(--accent)', marginBottom: '2px' }}>
                        {m.sender_name}
                      </div>
                      <div style={{ fontSize: '13.5px', color: '#fff' }}>{m.message}</div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
              <input
                className="input"
                placeholder="Type a message or shoot question..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
