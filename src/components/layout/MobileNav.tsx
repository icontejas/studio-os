import React from 'react';
import { LayoutDashboard, Calendar, Plus, Receipt, IndianRupee } from 'lucide-react';

interface MobileNavProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
  onOpenQuickModal: (type: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onSelectPage,
  onOpenQuickModal
}) => {
  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: '#0d0e12',
        borderTop: '1px solid var(--line)',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        padding: '0 10px'
      }}
    >
      <button
        onClick={() => onSelectPage('dashboard')}
        style={{
          background: 'none',
          border: 0,
          color: currentPage === 'dashboard' ? 'var(--accent)' : 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          cursor: 'pointer'
        }}
      >
        <LayoutDashboard size={18} />
        <span>Home</span>
      </button>

      <button
        onClick={() => onSelectPage('shoots')}
        style={{
          background: 'none',
          border: 0,
          color: currentPage === 'shoots' ? 'var(--accent)' : 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          cursor: 'pointer'
        }}
      >
        <Calendar size={18} />
        <span>Shoots</span>
      </button>

      {/* Floating Action Button */}
      <button
        onClick={() => onOpenQuickModal('shoot')}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent)',
          color: 'var(--accent-text)',
          border: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-accent)',
          cursor: 'pointer',
          marginTop: '-18px'
        }}
      >
        <Plus size={22} strokeWidth={3} />
      </button>

      <button
        onClick={() => onSelectPage('invoices')}
        style={{
          background: 'none',
          border: 0,
          color: currentPage === 'invoices' ? 'var(--accent)' : 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          cursor: 'pointer'
        }}
      >
        <Receipt size={18} />
        <span>Bills</span>
      </button>

      <button
        onClick={() => onSelectPage('money')}
        style={{
          background: 'none',
          border: 0,
          color: currentPage === 'money' ? 'var(--accent)' : 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          cursor: 'pointer'
        }}
      >
        <IndianRupee size={18} />
        <span>Money</span>
      </button>
    </nav>
  );
};
