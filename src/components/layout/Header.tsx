import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  UserPlus,
  FilePlus,
  Receipt,
  UploadCloud,
  ChevronDown,
  Film,
  Trash2
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenQuickModal: (type: string) => void;
  onOpenMigrationModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenQuickModal,
  onOpenMigrationModal
}) => {
  const { notifications, markNotificationRead, clearAllData } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target as Node)) {
        setShowQuickMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      {/* Search Bar Trigger */}
      <div style={{ flex: 1, maxWidth: '420px' }}>
        <button
          onClick={onOpenSearch}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '13px',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={15} color="var(--text-dim)" />
            <span>Search clients, projects, invoices, quotes...</span>
          </div>
          <kbd style={{
            background: 'var(--panel2)',
            border: '1px solid var(--line-strong)',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}>
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Action Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Quick Add Menu */}
        <div style={{ position: 'relative' }} ref={quickMenuRef}>
          <button
            className="btn btn-primary"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            <Plus size={16} />
            <span>Quick Create</span>
            <ChevronDown size={14} />
          </button>

          {showQuickMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '215px',
              background: 'var(--panel)',
              border: '1px solid var(--line-strong)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '6px',
              zIndex: 50,
              animation: 'scaleUp 0.12s ease-out'
            }}>
              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '9px 12px', fontSize: '13px' }}
                onClick={() => { setShowQuickMenu(false); onOpenQuickModal('project'); }}
              >
                <Film size={15} color="#38bdf8" />
                <span>New Project</span>
              </button>
              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '9px 12px', fontSize: '13px' }}
                onClick={() => { setShowQuickMenu(false); onOpenQuickModal('shoot'); }}
              >
                <Calendar size={15} color="var(--accent)" />
                <span>New Shoot</span>
              </button>
              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '9px 12px', fontSize: '13px' }}
                onClick={() => { setShowQuickMenu(false); onOpenQuickModal('client'); }}
              >
                <UserPlus size={15} color="var(--ok)" />
                <span>New Client</span>
              </button>
              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '9px 12px', fontSize: '13px' }}
                onClick={() => { setShowQuickMenu(false); onOpenQuickModal('quote'); }}
              >
                <FilePlus size={15} color="var(--warn)" />
                <span>New Quotation</span>
              </button>
              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '9px 12px', fontSize: '13px' }}
                onClick={() => { setShowQuickMenu(false); onOpenQuickModal('invoice'); }}
              >
                <Receipt size={15} color="#60a5fa" />
                <span>New Invoice</span>
              </button>
              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '9px 12px', fontSize: '13px' }}
                onClick={() => { setShowQuickMenu(false); onOpenQuickModal('payment'); }}
              >
                <DollarSign size={15} color="var(--ok)" />
                <span>Record Payment</span>
              </button>
              <div style={{ height: '1px', background: 'var(--line)', margin: '4px 0' }} />
              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '9px 12px', fontSize: '12px', color: 'var(--danger)' }}
                onClick={() => {
                  setShowQuickMenu(false);
                  if (window.confirm('Clear all demo data so you can start fresh with your real clients, projects, and invoices?')) {
                    clearAllData();
                  }
                }}
              >
                <Trash2 size={14} color="var(--danger)" />
                <span>Clear All Demo Data</span>
              </button>
              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '9px 12px', fontSize: '12px', color: 'var(--text-muted)' }}
                onClick={() => { setShowQuickMenu(false); onOpenMigrationModal(); }}
              >
                <UploadCloud size={14} />
                <span>Import Legacy Data</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: unreadCount > 0 ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: 'var(--danger)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                width: '18px',
                height: '18px',
                fontSize: '10.5px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '360px',
              background: 'var(--panel)',
              border: '1px solid var(--line-strong)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50,
              animation: 'scaleUp 0.12s ease-out',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Studio Notifications</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notifications.length} alerts</span>
              </div>
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    All caught up! No notifications.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid var(--line)',
                        background: n.read ? 'transparent' : 'rgba(217, 255, 98, 0.03)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ marginTop: '2px' }}>
                          {n.type.includes('overdue') ? <AlertCircle size={16} color="var(--danger)" /> :
                           n.type.includes('accepted') ? <CheckCircle2 size={16} color="var(--ok)" /> :
                           n.type.includes('shoot') ? <Calendar size={16} color="var(--accent)" /> :
                           <FileText size={16} color="var(--warn)" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: n.read ? 500 : 700, color: '#fff' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {n.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
