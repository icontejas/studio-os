import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Send,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatINR, formatDate, generateWhatsAppLink } from '../../lib/formatters';

interface DashboardViewProps {
  onNavigate: (page: string, id?: string) => void;
  onOpenQuickModal: (type: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenQuickModal
}) => {
  const {
    clients,
    projects,
    shoots,
    invoices,
    quotations,
    payments,
    tasks,
    totalRevenue,
    totalCollected,
    totalOutstanding,
    totalOverdue,
    activeShootsCount
  } = useData();

  // Upcoming shoots (next 4)
  const upcomingShoots = shoots
    .filter(s => s.status === 'Upcoming')
    .slice(0, 4);

  // Overdue and pending invoices needing attention
  const followUpInvoices = invoices.filter(inv => inv.balance > 0);

  // Stalled quotations
  const pendingQuotations = quotations.filter(q => q.status === 'SENT');

  // Due this week vs later
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const dueThisWeek = invoices
    .filter(inv => {
      if (inv.balance <= 0) return false;
      const d = new Date(inv.due_date);
      return d >= today && d <= nextWeek;
    })
    .reduce((acc, inv) => acc + inv.balance, 0);

  const dueLater = Math.max(0, totalOutstanding - totalOverdue - dueThisWeek);

  // Pipeline counts
  const pipelineStages = [
    { key: 'LEAD', label: 'Lead', count: projects.filter(p => p.status === 'LEAD').length },
    { key: 'QUOTED', label: 'Quoted', count: projects.filter(p => p.status === 'QUOTED').length },
    { key: 'BOOKED', label: 'Booked', count: projects.filter(p => p.status === 'BOOKED').length },
    { key: 'SHOOTING', label: 'Shooting', count: projects.filter(p => p.status === 'SHOOTING').length },
    { key: 'EDITING', label: 'Editing', count: projects.filter(p => p.status === 'EDITING').length },
    { key: 'REVIEW', label: 'Review', count: projects.filter(p => p.status === 'REVIEW').length },
    { key: 'DELIVERED', label: 'Delivered', count: projects.filter(p => p.status === 'DELIVERED' || p.status === 'COMPLETED').length }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Top Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} />
            <span>Studio Command Center</span>
          </div>
          <h1 style={{ fontSize: '32px', margin: '6px 0 4px', letterSpacing: '-0.04em' }}>
            Good afternoon, Tejas.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Here is what needs your attention today across shoots, revenue and follow-ups.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => onOpenQuickModal('shoot')}>
            <Plus size={16} />
            <span>New Shoot</span>
          </button>
          <button className="btn" onClick={() => onOpenQuickModal('quote')}>
            <Plus size={16} />
            <span>New Quote</span>
          </button>
        </div>
      </div>

      {/* 5 Financial & Production Metric Cards */}
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="metric-card accent">
          <div className="metric-label">
            <span>Total Revenue</span>
            <ArrowUpRight size={15} color="var(--accent)" />
          </div>
          <div className="metric-value">{formatINR(totalRevenue)}</div>
          <div className="metric-sub">Across all invoiced projects</div>
        </div>

        <div className="metric-card success">
          <div className="metric-label">
            <span>Collected</span>
            <span style={{ color: 'var(--ok)', fontSize: '11px', fontWeight: 700 }}>PAID</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--ok)' }}>{formatINR(totalCollected)}</div>
          <div className="metric-sub">Received in bank & UPI</div>
        </div>

        <div className="metric-card warning">
          <div className="metric-label">
            <span>Outstanding</span>
            <span style={{ color: 'var(--warn)', fontSize: '11px', fontWeight: 700 }}>PENDING</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--warn)' }}>{formatINR(totalOutstanding)}</div>
          <div className="metric-sub">Pending client clearance</div>
        </div>

        <div className="metric-card danger">
          <div className="metric-label">
            <span>Overdue</span>
            <span style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: 700 }}>ACTION</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--danger)' }}>{formatINR(totalOverdue)}</div>
          <div className="metric-sub">Needs WhatsApp follow-up</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            <span>Active Shoots</span>
            <Calendar size={15} color="var(--text-muted)" />
          </div>
          <div className="metric-value">{activeShootsCount}</div>
          <div className="metric-sub">Scheduled on calendar</div>
        </div>
      </div>

      {/* Two Column Section: Today's Schedule & Needs Attention */}
      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Today & Upcoming Shoots */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Upcoming Shoots & Call Times</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Location, client & equipment prep</span>
            </div>
            <button className="btn btn-sm" onClick={() => onNavigate('shoots')}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingShoots.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--line)', borderRadius: 'var(--radius-md)' }}>
                No upcoming shoots scheduled. Click + New Shoot to add one.
              </div>
            ) : (
              upcomingShoots.map(s => {
                const client = clients.find(c => c.id === s.client_id);
                return (
                  <div
                    key={s.id}
                    style={{
                      background: 'var(--panel2)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        background: 'rgba(217, 255, 98, 0.1)',
                        border: '1px solid rgba(217, 255, 98, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        textAlign: 'center',
                        minWidth: '55px'
                      }}>
                        <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase' }}>
                          {new Date(s.shoot_date + 'T12:00:00').toLocaleDateString('en-IN', { month: 'short' })}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                          {new Date(s.shoot_date + 'T12:00:00').getDate()}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{s.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
                          <span>{client?.name}</span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {s.start_time}
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {s.location.split(',')[0]}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--accent)' }}>
                        {formatINR(s.amount)}
                      </div>
                      <span className="badge badge-accent" style={{ marginTop: '4px' }}>
                        {s.shoot_type}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Needs Your Attention (Actionable Overdue & Quotations) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Needs Your Attention</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overdue payments & unanswered quotes</span>
            </div>
            <span className={`badge ${followUpInvoices.length + pendingQuotations.length > 0 ? 'badge-danger' : 'badge-success'}`}>
              {followUpInvoices.length + pendingQuotations.length} Pending
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {followUpInvoices.length === 0 && pendingQuotations.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--line)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 size={22} color="var(--ok)" style={{ marginBottom: '6px', display: 'inline-block' }} />
                <div style={{ fontSize: '13.5px', color: '#fff', fontWeight: 600 }}>All Caught Up!</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  No overdue invoices or pending quotations requiring attention.
                </div>
              </div>
            )}
            {followUpInvoices.map(inv => {
              const client = clients.find(c => c.id === inv.client_id);
              const waMsg = `Hey ${client?.name || 'there'}, just a quick reminder regarding the pending ${formatINR(inv.balance)} balance for ${inv.invoice_number}. Whenever convenient, please have a look. Thanks!`;
              const waLink = generateWhatsAppLink(client?.phone, waMsg);

              return (
                <div
                  key={inv.id}
                  style={{
                    background: 'var(--panel2)',
                    border: '1px solid var(--danger-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={15} color="var(--danger)" />
                      <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#fff' }}>{client?.name}</span>
                      <span className="badge badge-danger" style={{ fontSize: '10.5px' }}>
                        {formatINR(inv.balance)} Due
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {inv.invoice_number} · Due {formatDate(inv.due_date)}
                    </div>
                  </div>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-whatsapp btn-sm"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              );
            })}

            {pendingQuotations.map(q => {
              const client = clients.find(c => c.id === q.client_id);
              const waMsg = `Hey ${client?.name || 'there'}, just following up on the quotation ${q.quotation_number} (${formatINR(q.total)}) I shared. Let me know if you'd like to go ahead or make any tweaks!`;
              const waLink = generateWhatsAppLink(client?.phone, waMsg);

              return (
                <div
                  key={q.id}
                  style={{
                    background: 'var(--panel2)',
                    border: '1px solid var(--warn-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Send size={14} color="var(--warn)" />
                      <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#fff' }}>{client?.name}</span>
                      <span className="badge badge-warning" style={{ fontSize: '10.5px' }}>
                        {formatINR(q.total)} Quoted
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {q.quotation_number} · Awaiting response
                    </div>
                  </div>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-whatsapp btn-sm"
                  >
                    <MessageCircle size={13} />
                    <span>Follow Up</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Money Overview & Cash Pipeline */}
      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Money Aging Buckets */}
        <div className="card">
          <h2 style={{ fontSize: '18px', margin: '0 0 14px' }}>Money Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ background: 'var(--panel2)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Outstanding</div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '6px' }}>{formatINR(totalOutstanding)}</div>
            </div>
            <div style={{ background: 'var(--panel2)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11.5px', color: 'var(--danger)', textTransform: 'uppercase', fontWeight: 600 }}>Overdue</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--danger)', marginTop: '6px' }}>{formatINR(totalOverdue)}</div>
            </div>
            <div style={{ background: 'var(--panel2)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11.5px', color: 'var(--warn)', textTransform: 'uppercase', fontWeight: 600 }}>Due This Week</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--warn)', marginTop: '6px' }}>{formatINR(dueThisWeek)}</div>
            </div>
            <div style={{ background: 'var(--panel2)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Due Later</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-muted)', marginTop: '6px' }}>{formatINR(dueLater)}</div>
            </div>
          </div>
        </div>

        {/* Project Pipeline Funnel */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', margin: 0 }}>Project Lifecycle Pipeline</h2>
            <button className="btn btn-sm" onClick={() => onNavigate('projects')}>
              Manage Projects
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {pipelineStages.map(stage => (
              <div
                key={stage.key}
                style={{
                  background: 'var(--panel2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 6px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{stage.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: stage.count > 0 ? 'var(--accent)' : 'var(--text-dim)', marginTop: '4px' }}>
                  {stage.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>Recent Activity Stream</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Latest payments, quotations & project updates</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {payments.slice(0, 3).map(p => {
            const client = clients.find(c => c.id === p.client_id);
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--panel2)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--line)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'var(--ok-bg)', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
                    <ArrowUpRight size={16} color="var(--ok)" />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '13.5px' }}>Payment received from {client?.name}</span>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>via {p.payment_method} · {p.reference || 'Direct'}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--ok)' }}>
                  +{formatINR(p.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
