import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Filter,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Video,
  Camera,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Shoot, ShootType } from '../../types/database';
import { formatINR, formatDate } from '../../lib/formatters';

const DEFAULT_SHOOT_TYPES: string[] = [
  'Car Delivery',
  'Automotive Promo',
  'Brand Promo',
  'Instagram Reel',
  'Wedding / Pre-Wedding',
  'Fashion / Lookbook',
  'Corporate',
  'Event',
  'Real Estate',
  'Music Video',
  'Commercial Ad',
  'Photography',
  'Drone',
  'Other'
];

export const ShootsView: React.FC = () => {
  const { shoots, clients, projects, addClient, addShoot, updateShoot, deleteShoot } = useData();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Custom shoot types stored locally
  const [customTypes, setCustomTypes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('studioos_custom_shoot_types');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCustomType, setIsCustomType] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    client_id: clients[0]?.id || '',
    inline_client_name: '',
    inline_client_phone: '',
    project_id: '',
    shoot_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '14:00',
    location: '',
    shoot_type: 'Car Delivery' as ShootType,
    custom_type: '',
    amount: 15000,
    status: 'Upcoming' as Shoot['status'],
    notes: ''
  });

  const allShootTypes = Array.from(
    new Set([
      ...DEFAULT_SHOOT_TYPES,
      ...customTypes,
      ...shoots.map(s => s.shoot_type).filter(Boolean)
    ])
  );

  const filteredShoots = shoots.filter(s => {
    if (filterType !== 'ALL' && s.shoot_type !== filterType) return false;
    return true;
  });

  const handleCreateShoot = async (e: React.FormEvent) => {
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
      alert('Please select or enter client details.');
      return;
    }

    const finalShootType: ShootType = isCustomType && formData.custom_type.trim()
      ? (formData.custom_type.trim() as ShootType)
      : formData.shoot_type;

    if (isCustomType && formData.custom_type.trim()) {
      const trimmed = formData.custom_type.trim();
      if (!customTypes.includes(trimmed)) {
        const updated = [...customTypes, trimmed];
        setCustomTypes(updated);
        try {
          localStorage.setItem('studioos_custom_shoot_types', JSON.stringify(updated));
        } catch (err) {
          console.error(err);
        }
      }
    }

    addShoot({
      title: formData.title,
      client_id: targetClientId,
      project_id: formData.project_id || undefined,
      shoot_date: formData.shoot_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      location: formData.location,
      shoot_type: finalShootType,
      amount: Number(formData.amount) || 0,
      status: formData.status,
      notes: formData.notes
    });
    setShowAddModal(false);
    setIsCustomType(false);
    setFormData({
      title: '',
      client_id: clients[0]?.id || '',
      inline_client_name: '',
      inline_client_phone: '',
      project_id: '',
      shoot_date: new Date().toISOString().split('T')[0],
      start_time: '10:00',
      end_time: '14:00',
      location: '',
      shoot_type: 'Car Delivery',
      custom_type: '',
      amount: 15000,
      status: 'Upcoming',
      notes: ''
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0 }}>Shoots & Production Calendar</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Track upcoming shoot schedules, call times, location addresses, and equipment notes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
            <button
              className="btn btn-sm"
              style={{
                background: viewMode === 'list' ? 'var(--panel2)' : 'transparent',
                border: 0,
                color: viewMode === 'list' ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => setViewMode('list')}
            >
              <List size={14} />
              <span>List</span>
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: viewMode === 'calendar' ? 'var(--panel2)' : 'transparent',
                border: 0,
                color: viewMode === 'calendar' ? '#fff' : 'var(--text-muted)'
              }}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon size={14} />
              <span>Calendar</span>
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>New Shoot</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilterType('ALL')}
        >
          All Shoots ({shoots.length})
        </button>
        {allShootTypes.map(st => {
          const count = shoots.filter(s => s.shoot_type === st).length;
          if (count === 0 && !customTypes.includes(st)) return null;
          return (
            <button
              key={st}
              className={`btn btn-sm ${filterType === st ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterType(st)}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date & Call Time</th>
                <th>Shoot & Client</th>
                <th>Type</th>
                <th>Location</th>
                <th>Production Value</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShoots.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No shoots found for the selected filter. Click &quot;+ New Shoot&quot; to book one.
                  </td>
                </tr>
              ) : (
                filteredShoots.map(s => {
                  const client = clients.find(c => c.id === s.client_id);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>
                          {formatDate(s.shoot_date)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Clock size={12} /> {s.start_time} - {s.end_time}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{s.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{client?.name}</div>
                      </td>

                      <td>
                        <span className="badge badge-accent">{s.shoot_type}</span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <MapPin size={13} color="var(--accent)" />
                          <span>{s.location}</span>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff' }}>
                          {formatINR(s.amount)}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${s.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                          {s.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {s.status === 'Upcoming' && (
                            <button
                              className="btn btn-sm"
                              onClick={() => updateShoot(s.id, { status: 'Completed' })}
                              title="Mark Completed"
                            >
                              <CheckCircle size={13} color="var(--ok)" />
                              <span>Done</span>
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete shoot "${s.title}"?`)) {
                                deleteShoot(s.id);
                              }
                            }}
                            title="Delete Shoot"
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
      )}

      {/* Calendar Grid View */}
      {viewMode === 'calendar' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', margin: 0 }}>September 2026</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn btn-sm btn-ghost"><ChevronLeft size={16} /></button>
              <button className="btn btn-sm btn-ghost"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '10px',
            fontWeight: 700
          }}>
            <div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div><div>SUN</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-09-${String(dayNum).padStart(2, '0')}`;
              const dayShoots = shoots.filter(s => s.shoot_date === dateStr);

              return (
                <div
                  key={dayNum}
                  style={{
                    minHeight: '100px',
                    background: dayShoots.length > 0 ? 'var(--panel2)' : 'var(--bg-subtle)',
                    border: dayShoots.length > 0 ? '1px solid var(--accent)' : '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 800, color: dayShoots.length > 0 ? 'var(--accent)' : 'var(--text-dim)' }}>
                    {dayNum}
                  </span>

                  {dayShoots.map(s => (
                    <div
                      key={s.id}
                      style={{
                        background: 'rgba(217, 255, 98, 0.15)',
                        border: '1px solid rgba(217, 255, 98, 0.3)',
                        borderRadius: '4px',
                        padding: '3px 6px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: '#fff',
                        textAlign: 'left',
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={`${s.title} (${s.start_time})`}
                    >
                      {s.start_time} · {s.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Shoot Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', margin: 0 }}>Book New Shoot</h2>
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateShoot}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="field">
                  <label className="field-label">Shoot Title *</label>
                  <input
                    className="input"
                    placeholder="e.g. BMW X5 Handover Film"
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
                          <option key={c.id} value={c.id}>{c.name} ({c.company || 'Individual'})</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label className="field-label">Shoot Type</label>
                      <select
                        className="select"
                        value={isCustomType ? '__CUSTOM__' : formData.shoot_type}
                        onChange={e => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomType(true);
                          } else {
                            setIsCustomType(false);
                            setFormData({ ...formData, shoot_type: e.target.value as ShootType });
                          }
                        }}
                      >
                        <optgroup label="Standard Types">
                          {DEFAULT_SHOOT_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </optgroup>
                        {customTypes.length > 0 && (
                          <optgroup label="Custom Types">
                            {customTypes.map(ct => (
                              <option key={ct} value={ct}>{ct}</option>
                            ))}
                          </optgroup>
                        )}
                        <option value="__CUSTOM__">✨ + Add Custom / New Shoot Type...</option>
                      </select>

                      {isCustomType && (
                        <div style={{ marginTop: '8px' }}>
                          <input
                            className="input"
                            style={{ borderColor: 'var(--accent)' }}
                            placeholder="Enter Custom Type (e.g. Pre-Wedding, Podcast, Food Film)"
                            required
                            value={formData.custom_type}
                            onChange={e => setFormData({ ...formData, custom_type: e.target.value })}
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {clients.length === 0 && (
                  <div className="field">
                    <label className="field-label">Shoot Type</label>
                    <select
                      className="select"
                      value={isCustomType ? '__CUSTOM__' : formData.shoot_type}
                      onChange={e => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsCustomType(true);
                        } else {
                          setIsCustomType(false);
                          setFormData({ ...formData, shoot_type: e.target.value as ShootType });
                        }
                      }}
                    >
                      <optgroup label="Standard Types">
                        {DEFAULT_SHOOT_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </optgroup>
                      {customTypes.length > 0 && (
                        <optgroup label="Custom Types">
                          {customTypes.map(ct => (
                            <option key={ct} value={ct}>{ct}</option>
                          ))}
                        </optgroup>
                      )}
                      <option value="__CUSTOM__">✨ + Add Custom / New Shoot Type...</option>
                    </select>

                    {isCustomType && (
                      <div style={{ marginTop: '8px' }}>
                        <input
                          className="input"
                          style={{ borderColor: 'var(--accent)' }}
                          placeholder="Enter Custom Type (e.g. Pre-Wedding, Podcast, Food Film)"
                          required
                          value={formData.custom_type}
                          onChange={e => setFormData({ ...formData, custom_type: e.target.value })}
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="grid-3">
                  <div className="field">
                    <label className="field-label">Shoot Date *</label>
                    <input
                      className="input"
                      type="date"
                      required
                      value={formData.shoot_date}
                      onChange={e => setFormData({ ...formData, shoot_date: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">Call Time</label>
                    <input
                      className="input"
                      type="time"
                      value={formData.start_time}
                      onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">End Time</label>
                    <input
                      className="input"
                      type="time"
                      value={formData.end_time}
                      onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">Shoot Location *</label>
                    <input
                      className="input"
                      placeholder="e.g. BMW Gurgaon Showroom, Golf Course Rd"
                      required
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">Shoot Value (₹)</label>
                    <input
                      className="input"
                      type="number"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Crew / Equipment / Prep Notes</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    placeholder="e.g. Bring polarizer, wireless lavs, gimbal extra batteries..."
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
                  Book Shoot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
