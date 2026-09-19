import React from 'react';
import {
  LayoutDashboard,
  Users,
  Film,
  Calendar,
  FileText,
  Receipt,
  IndianRupee,
  Layers,
  ExternalLink,
  Sparkles,
  Database,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  onOpenQuickModal: (type: string) => void;
  onOpenPortalModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  onOpenQuickModal,
  onOpenPortalModal
}) => {
  const { business, isDemoMode, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'projects', label: 'Projects', icon: Film },
    { id: 'shoots', label: 'Shoots & Calendar', icon: Calendar },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'invoices', label: 'Invoices & Bills', icon: Receipt },
    { id: 'money', label: 'Money & Expenses', icon: IndianRupee },
    { id: 'services', label: 'Services & Packages', icon: Layers }
  ];

  return (
    <aside className="desktop-sidebar" style={{
      width: '260px',
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      background: '#0d0e12',
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
      padding: '24px 16px'
    }}>
      {/* Brand Header */}
      <div style={{ padding: '0 12px 20px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#fff'
          }}>
            Studio<span style={{ color: 'var(--accent)' }}>OS</span>
          </div>
          <span style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '3px 7px',
            borderRadius: 'var(--radius-full)',
            background: isDemoMode ? 'rgba(217, 255, 98, 0.12)' : 'rgba(114, 224, 165, 0.15)',
            color: isDemoMode ? 'var(--accent)' : 'var(--ok)',
            fontWeight: 700,
            border: isDemoMode ? '1px solid rgba(217, 255, 98, 0.3)' : '1px solid rgba(114, 224, 165, 0.3)'
          }}>
            {isDemoMode ? 'DEMO' : 'LIVE'}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {business.name}
        </div>
      </div>

      {/* Quick Action Button */}
      <div style={{ padding: '16px 4px 8px' }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => onOpenQuickModal('shoot')}
        >
          <Sparkles size={15} />
          <span>+ New Shoot</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', padding: '6px 12px' }}>
          Studio Management
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 0,
                  background: active ? 'var(--panel2)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-muted)',
                  fontWeight: active ? 600 : 500,
                  fontSize: '13.5px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                <Icon size={17} style={{ color: active ? 'var(--accent)' : 'inherit' }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Client Portal Section */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', padding: '6px 12px' }}>
            External Portals
          </div>
          <button
            onClick={onOpenPortalModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              background: 'var(--panel)',
              color: 'var(--accent)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ExternalLink size={15} />
              <span>Client Portal</span>
            </div>
            <span style={{ fontSize: '10px', background: 'rgba(217,255,98,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              PRO
            </span>
          </button>
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div style={{ paddingTop: '14px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--panel2)',
            border: '1px solid var(--line-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '14px',
            color: 'var(--accent)'
          }}>
            T
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Tejas</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Videographer</div>
          </div>
        </div>

        <button
          className="btn-ghost"
          style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
          title="Sign out / Reset"
          onClick={() => signOut()}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
