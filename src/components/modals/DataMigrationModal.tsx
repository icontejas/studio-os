import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface DataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({ isOpen, onClose }) => {
  const { migrateLegacyData } = useData();
  const [status, setStatus] = useState<'idle' | 'success' | 'empty'>('idle');

  if (!isOpen) return null;

  const handleMigrate = () => {
    const success = migrateLegacyData();
    if (success) {
      setStatus('success');
      setTimeout(() => onClose(), 1500);
    } else {
      setStatus('empty');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ width: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '18px', margin: 0 }}>Import Prototype Data</h2>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            If you have existing client records, quotes or invoices stored in the previous prototype&apos;s localStorage, StudioOS can seamlessly import and preserve them in the new production schema.
          </p>

          {status === 'success' && (
            <div style={{ background: 'var(--ok-bg)', border: '1px solid var(--ok-border)', color: 'var(--ok)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>Legacy data imported successfully!</span>
            </div>
          )}

          {status === 'empty' && (
            <div style={{ background: 'var(--panel2)', border: '1px solid var(--line)', color: 'var(--text-muted)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>No legacy prototype data found in browser storage. Current database is ready!</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleMigrate}>
            <UploadCloud size={15} />
            <span>Start Import</span>
          </button>
        </div>
      </div>
    </div>
  );
};
