import React, { useState } from 'react';
import { Layers, Plus, Check, Sparkles, Tag, Video, Camera } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../lib/formatters';

export const ServicesView: React.FC = () => {
  const { services, packages } = useData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', margin: 0 }}>Services & Production Packages</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Catalog of standardized creative services and turnkey packages used in quotation building.
        </p>
      </div>

      {/* Production Packages Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sparkles size={18} color="var(--accent)" />
          <h2 style={{ fontSize: '20px', margin: 0 }}>Turnkey Packages</h2>
        </div>

        <div className="grid-2">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--line-strong)',
                background: 'linear-gradient(180deg, var(--panel) 0%, var(--panel2) 100%)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-accent" style={{ marginBottom: '6px' }}>PACKAGE</span>
                    <h3 style={{ fontSize: '20px', margin: 0, color: '#fff' }}>{pkg.name}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent)' }}>
                      {formatINR(pkg.price)}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '10px 0 16px' }}>
                  {pkg.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(pkg.features || []).map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <Check size={14} color="var(--accent)" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Standard Services */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Layers size={18} color="#60a5fa" />
          <h2 style={{ fontSize: '20px', margin: 0 }}>A La Carte Services</h2>
        </div>

        <div className="grid-3">
          {services.map(s => (
            <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '16px', margin: 0, color: '#fff' }}>{s.name}</h3>
                <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '16px' }}>
                  {formatINR(s.default_price)}
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                {s.description}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                  {s.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
