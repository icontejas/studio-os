import React, { useState } from 'react';
import {
  Film,
  Plus,
  Search,
  ExternalLink,
  DollarSign,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  Layers,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Project, ProjectStatus, DeliverableType, DeliverableStatus } from '../../types/database';
import { formatINR, formatDate, getStatusBadgeClass } from '../../lib/formatters';

const PROJECT_STATUSES: ProjectStatus[] = [
  'LEAD',
  'QUOTED',
  'BOOKED',
  'SHOOTING',
  'EDITING',
  'REVIEW',
  'DELIVERED',
  'COMPLETED'
];

interface ProjectsViewProps {
  onOpenClientPortal: (token: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenClientPortal }) => {
  const {
    projects,
    clients,
    expenses,
    tasks,
    deliverables,
    addClient,
    addProject,
    updateProject,
    deleteProject,
    addDeliverable
  } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Deliverable inline state inside drawer
  const [newDelName, setNewDelName] = useState('');
  const [newDelType, setNewDelType] = useState<DeliverableType>('Video');
  const [showDelForm, setShowDelForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    client_id: clients[0]?.id || '',
    inline_client_name: '',
    inline_client_phone: '',
    project_type: 'Automotive Promo',
    status: 'BOOKED' as ProjectStatus,
    shoot_date: new Date().toISOString().split('T')[0],
    start_time: '11:00',
    location: '',
    total_amount: 20000,
    advance_amount: 10000,
    due_date: '',
    description: '',
    notes: ''
  });

  const filteredProjects = projects.filter(p => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    const client = clients.find(c => c.id === p.client_id);
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      client?.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    let targetClientId = formData.client_id;
    if (!targetClientId && formData.inline_client_name) {
      const newC = await addClient({
        name: formData.inline_client_name,
        phone: formData.inline_client_phone || '',
        email: '',
        company: '',
        billing_address: ''
      });
      targetClientId = newC.id;
    }

    if (!targetClientId) {
      alert('Please select or specify a client.');
      return;
    }

    const newP = await addProject({
      title: formData.title,
      client_id: targetClientId,
      project_type: formData.project_type,
      status: formData.status,
      shoot_date: formData.shoot_date,
      start_time: formData.start_time,
      location: formData.location,
      total_amount: Number(formData.total_amount) || 0,
      advance_amount: Number(formData.advance_amount) || 0,
      description: formData.description,
      notes: formData.notes
    });

    setShowAddModal(false);
    setSelectedProject(newP);
  };

  const handleAddDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newDelName.trim()) return;
    await addDeliverable({
      project_id: selectedProject.id,
      name: newDelName.trim(),
      type: newDelType,
      status: 'PROCESSING' as DeliverableStatus
    });
    setNewDelName('');
    setShowDelForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Projects & Deliverables</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Manage full project lifecycle from lead to shooting, color grading, review and delivery.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setStatusFilter('ALL')}
        >
          All Projects ({projects.length})
        </button>
        {PROJECT_STATUSES.map(st => {
          const count = projects.filter(p => p.status === st).length;
          if (count === 0) return null;
          return (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Projects Grid / Empty State */}
      {filteredProjects.length === 0 ? (
        <div style={{
          background: 'var(--panel)',
          border: '1px dashed var(--line-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '60px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(217, 255, 98, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Film size={28} color="var(--accent)" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>No Projects Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', maxWidth: '400px', margin: '6px auto 0' }}>
              Create your real client projects to track production schedules, deliverables, client review portals, and profit margins.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ marginTop: '8px' }}>
            <Plus size={16} />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {filteredProjects.map(p => {
            const client = clients.find(c => c.id === p.client_id);
            const projectExpenses = expenses.filter(e => e.project_id === p.id);
            const totalExp = projectExpenses.reduce((acc, e) => acc + e.amount, 0);
            const profit = p.total_amount - totalExp;
            const profitMargin = p.total_amount > 0 ? Math.round((profit / p.total_amount) * 100) : 100;
            const projectDeliverables = deliverables.filter(d => d.project_id === p.id);

            return (
              <div
                key={p.id}
                className="card card-hover"
                style={{ display: 'flex', flexDirection: 'column', gap: '14px', cursor: 'pointer' }}
                onClick={() => setSelectedProject(p)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={`badge ${getStatusBadgeClass(p.status)}`}>
                    {p.status}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {p.project_type}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>{p.title}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {client?.name || 'Unassigned Client'}
                  </div>
                </div>

                {p.location && (
                  <div style={{ fontSize: '12.5px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="var(--accent)" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.location}
                    </span>
                  </div>
                )}

                {/* Financial & Profitability Mini Bar */}
                <div style={{
                  background: 'var(--panel2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Value</div>
                    <div style={{ fontSize: '15px', fontWeight: 800 }}>{formatINR(p.total_amount)}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Profit</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ok)' }}>
                      {formatINR(profit)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Margin</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
                      {profitMargin}%
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--line)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{projectDeliverables.length} Deliverables</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {client?.portal_token && (
                      <button
                        className="btn-ghost"
                        style={{ padding: '4px', fontSize: '12px', color: 'var(--accent)' }}
                        onClick={e => {
                          e.stopPropagation();
                          onOpenClientPortal(client.portal_token);
                        }}
                      >
                        Portal View <ExternalLink size={12} />
                      </button>
                    )}
                    <button
                      className="btn-ghost"
                      style={{ padding: '4px', color: 'var(--danger)' }}
                      title="Delete Project"
                      onClick={e => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete project "${p.title}"?`)) {
                          deleteProject(p.id);
                          if (selectedProject?.id === p.id) setSelectedProject(null);
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', margin: 0 }}>Create New Project</h2>
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="field">
                  <label className="field-label">Project Title *</label>
                  <input
                    className="input"
                    placeholder="e.g. BMW X5 Delivery Film"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

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
                          value={formData.inline_client_name}
                          onChange={e => setFormData({ ...formData, inline_client_name: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label className="field-label">Client Phone</label>
                        <input
                          className="input"
                          placeholder="+91 98765 43210"
                          value={formData.inline_client_phone}
                          onChange={e => setFormData({ ...formData, inline_client_phone: e.target.value })}
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
                        value={formData.client_id}
                        onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                      >
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label className="field-label">Project Status</label>
                      <select
                        className="select"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                      >
                        {PROJECT_STATUSES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">Total Project Value (₹) *</label>
                    <input
                      className="input"
                      type="number"
                      required
                      value={formData.total_amount}
                      onChange={e => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Advance Deposit (₹)</label>
                    <input
                      className="input"
                      type="number"
                      value={formData.advance_amount}
                      onChange={e => setFormData({ ...formData, advance_amount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">Shoot Date</label>
                    <input
                      className="input"
                      type="date"
                      value={formData.shoot_date}
                      onChange={e => setFormData({ ...formData, shoot_date: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">Location</label>
                    <input
                      className="input"
                      placeholder="e.g. DLF Cyber City / Nagpur"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Project Scope & Client Requirements</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    placeholder="Deliverables: 1x 4K Master, 2x Reels, 20 color-graded photos..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Detail Drawer */}
      {selectedProject && (
        <div className="drawer-overlay" onClick={() => setSelectedProject(null)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className={`badge ${getStatusBadgeClass(selectedProject.status)}`} style={{ marginBottom: '8px' }}>
                  {selectedProject.status}
                </span>
                <h2 style={{ fontSize: '22px', margin: 0 }}>{selectedProject.title}</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {clients.find(c => c.id === selectedProject.client_id)?.name || 'Client'}
                </div>
              </div>
              <button className="btn-ghost" onClick={() => setSelectedProject(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Quick Status Updater */}
            <div style={{ margin: '20px 0', padding: '14px', background: 'var(--panel2)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                Update Project Status
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {PROJECT_STATUSES.map(st => (
                  <button
                    key={st}
                    className={`btn btn-sm ${selectedProject.status === st ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => {
                      updateProject(selectedProject.id, { status: st });
                      setSelectedProject({ ...selectedProject, status: st });
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--panel2)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Value</div>
                <div style={{ fontSize: '17px', fontWeight: 800, marginTop: '4px' }}>{formatINR(selectedProject.total_amount)}</div>
              </div>
              <div style={{ background: 'var(--panel2)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Advance Paid</div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ok)', marginTop: '4px' }}>{formatINR(selectedProject.advance_amount)}</div>
              </div>
              <div style={{ background: 'var(--panel2)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Balance Due</div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--warn)', marginTop: '4px' }}>{formatINR(selectedProject.total_amount - selectedProject.advance_amount)}</div>
              </div>
            </div>

            {/* Deliverables on this project */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '16px', margin: 0 }}>Project Deliverables</h3>
                <button className="btn btn-sm" onClick={() => setShowDelForm(!showDelForm)}>
                  <Plus size={13} />
                  <span>Add Deliverable</span>
                </button>
              </div>

              {showDelForm && (
                <form onSubmit={handleAddDeliverable} style={{ background: 'var(--panel2)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    className="input"
                    placeholder="Deliverable Name (e.g. 4K Master Reel)"
                    required
                    value={newDelName}
                    onChange={e => setNewDelName(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select className="select" value={newDelType} onChange={e => setNewDelType(e.target.value as DeliverableType)}>
                      <option value="Video">Video</option>
                      <option value="Reel">Reel</option>
                      <option value="Photo Gallery">Photo Gallery</option>
                      <option value="Raw Footage">Raw Footage</option>
                      <option value="Document">Document</option>
                      <option value="Other">Other</option>
                    </select>
                    <button type="submit" className="btn btn-primary btn-sm">Save</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowDelForm(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {deliverables.filter(d => d.project_id === selectedProject.id).length === 0 ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '12px', background: 'var(--panel2)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    No deliverables added yet. Click &quot;Add Deliverable&quot; above.
                  </div>
                ) : (
                  deliverables.filter(d => d.project_id === selectedProject.id).map(del => (
                    <div
                      key={del.id}
                      style={{
                        background: 'var(--panel2)',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#fff' }}>{del.name}</div>
                        <span className={`badge ${getStatusBadgeClass(del.status)}`} style={{ fontSize: '10px', marginTop: '4px' }}>
                          {del.status}
                        </span>
                      </div>
                      {del.preview_url && (
                        <a href={del.preview_url} target="_blank" rel="noreferrer" className="btn btn-sm">
                          Preview
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Danger Zone: Delete Project */}
            <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
              <button
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete project "${selectedProject.title}"?`)) {
                    deleteProject(selectedProject.id);
                    setSelectedProject(null);
                  }
                }}
              >
                <Trash2 size={15} />
                <span>Delete Project</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
