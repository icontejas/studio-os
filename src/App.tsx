import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { ClientsView } from './components/clients/ClientsView';
import { ShootsView } from './components/shoots/ShootsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { QuotationsView } from './components/quotations/QuotationsView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { MoneyView } from './components/money/MoneyView';
import { ServicesView } from './components/services/ServicesView';
import { ClientPortalView } from './components/portal/ClientPortalView';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { DataMigrationModal } from './components/modals/DataMigrationModal';
import { X } from 'lucide-react';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const { clients, addClient, addProject, addShoot, addQuotation, addInvoice, recordPayment } = useData();

  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [portalToken, setPortalToken] = useState<string | null>(null);

  // Quick Create Modal State
  const [quickModalType, setQuickModalType] = useState<string | null>(null);
  const [quickShootIsCustom, setQuickShootIsCustom] = useState(false);

  // Check URL pathname or query parameters for portal links on load
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/portal/')) {
      const token = path.replace('/portal/', '').trim();
      if (token) setPortalToken(token);
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) setPortalToken(token);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0c0f', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent)' }}>StudioOS</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>Loading Creative Business OS...</div>
        </div>
      </div>
    );
  }

  // If viewing client portal
  if (portalToken) {
    return (
      <ClientPortalView
        token={portalToken}
        onExitPortal={() => {
          setPortalToken(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        onOpenQuickModal={setQuickModalType}
        onOpenPortalModal={() => setPortalToken(clients[0]?.portal_token || 'portal-rahul-sharma')}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Sticky Header */}
        <Header
          onOpenSearch={() => setSearchOpen(true)}
          onOpenQuickModal={setQuickModalType}
          onOpenMigrationModal={() => setMigrationModalOpen(true)}
        />

        {/* View Router */}
        <div className="content-body">
          {currentPage === 'dashboard' && (
            <DashboardView
              onNavigate={(page) => setCurrentPage(page)}
              onOpenQuickModal={setQuickModalType}
            />
          )}

          {currentPage === 'clients' && (
            <ClientsView
              onOpenClientPortal={(token) => setPortalToken(token)}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'projects' && (
            <ProjectsView
              onOpenClientPortal={(token) => setPortalToken(token)}
            />
          )}

          {currentPage === 'shoots' && <ShootsView />}

          {currentPage === 'quotations' && (
            <QuotationsView
              onNavigateToInvoices={() => setCurrentPage('invoices')}
            />
          )}

          {currentPage === 'invoices' && <InvoicesView />}

          {currentPage === 'money' && <MoneyView />}

          {currentPage === 'services' && <ServicesView />}
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          onOpenQuickModal={setQuickModalType}
        />
      </div>

      {/* Global Search Modal (Ctrl + K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(page) => {
          setCurrentPage(page);
          setSearchOpen(false);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Data Migration Modal */}
      <DataMigrationModal
        isOpen={migrationModalOpen}
        onClose={() => setMigrationModalOpen(false)}
      />

      {/* Quick Action Modal Switcher */}
      {quickModalType && (
        <div className="modal-overlay" onClick={() => setQuickModalType(null)}>
          <div className="modal-content" style={{ width: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', margin: 0 }}>
                {quickModalType === 'project' ? 'Create New Project' :
                  quickModalType === 'client' ? 'Add Client' :
                    quickModalType === 'shoot' ? 'Book Shoot' :
                      quickModalType === 'quote' ? 'Create Quotation' :
                        quickModalType === 'invoice' ? 'Create Invoice' : 'Record Payment'}
              </h2>
              <button className="btn-ghost" onClick={() => setQuickModalType(null)}><X size={16} /></button>
            </div>

            {quickModalType === 'project' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as any;
                let targetClientId = form.client_id?.value;

                if (!targetClientId && form.inline_client_name?.value) {
                  const newC = await addClient({
                    name: form.inline_client_name.value,
                    phone: form.inline_client_phone?.value || '',
                    email: '',
                    company: '',
                    billing_address: ''
                  });
                  targetClientId = newC.id;
                }

                if (!targetClientId) {
                  alert('Please select or create a client for this project.');
                  return;
                }

                await addProject({
                  title: form.title.value,
                  client_id: targetClientId,
                  project_type: form.project_type.value,
                  status: form.status.value,
                  shoot_date: form.shoot_date.value,
                  start_time: '11:00',
                  location: form.location.value,
                  total_amount: Number(form.total_amount.value) || 0,
                  advance_amount: Number(form.advance_amount.value) || 0,
                  description: form.description.value
                });

                setQuickModalType(null);
                setCurrentPage('projects');
              }}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="field">
                    <label className="field-label">Project Title *</label>
                    <input className="input" name="title" required placeholder="e.g. BMW X5 Cinematic Handover Film" />
                  </div>

                  {clients.length === 0 ? (
                    <div style={{ background: 'var(--panel2)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>
                        No clients added yet. Enter client details below:
                      </div>
                      <div className="grid-2">
                        <div className="field">
                          <label className="field-label">Client Name *</label>
                          <input className="input" name="inline_client_name" required placeholder="e.g. BMW Motors Nagpur" />
                        </div>
                        <div className="field">
                          <label className="field-label">Phone Number</label>
                          <input className="input" name="inline_client_phone" placeholder="+91 98765 43210" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid-2">
                      <div className="field">
                        <label className="field-label">Client *</label>
                        <select className="select" name="client_id" required defaultValue={clients[0]?.id}>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label className="field-label">Project Type</label>
                        <select className="select" name="project_type">
                          <option value="Automotive Promo">Automotive Promo</option>
                          <option value="Car Delivery">Car Delivery</option>
                          <option value="Instagram Reel">Instagram Reel</option>
                          <option value="Brand Commercial">Brand Commercial</option>
                          <option value="Fashion / Event">Fashion / Event</option>
                          <option value="Drone Video">Drone Video</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {clients.length > 0 && (
                    <div className="field">
                      <label className="field-label">Project Type</label>
                      <select className="select" name="project_type">
                        <option value="Automotive Promo">Automotive Promo</option>
                        <option value="Car Delivery">Car Delivery</option>
                        <option value="Instagram Reel">Instagram Reel</option>
                        <option value="Brand Commercial">Brand Commercial</option>
                        <option value="Fashion / Event">Fashion / Event</option>
                        <option value="Drone Video">Drone Video</option>
                      </select>
                    </div>
                  )}

                  <div className="grid-2">
                    <div className="field">
                      <label className="field-label">Total Value (₹) *</label>
                      <input className="input" name="total_amount" type="number" required defaultValue="20000" />
                    </div>
                    <div className="field">
                      <label className="field-label">Advance Deposit (₹)</label>
                      <input className="input" name="advance_amount" type="number" defaultValue="10000" />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="field">
                      <label className="field-label">Shoot Date</label>
                      <input className="input" name="shoot_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="field">
                      <label className="field-label">Location</label>
                      <input className="input" name="location" placeholder="e.g. DLF Cyber Hub / Nagpur" />
                    </div>
                  </div>

                  <input type="hidden" name="status" value="BOOKED" />

                  <div className="field">
                    <label className="field-label">Scope & Requirements</label>
                    <textarea className="textarea" name="description" rows={2} placeholder="e.g. 1x 4K Master Video, 2x Reels, 20 photos" />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setQuickModalType(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Project</button>
                </div>
              </form>
            )}

            {quickModalType === 'client' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                addClient({
                  name: form.name.value,
                  phone: form.phone.value,
                  email: form.email.value,
                  company: form.company.value,
                  billing_address: form.billing_address.value
                });
                setQuickModalType(null);
                setCurrentPage('clients');
              }}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="field">
                    <label className="field-label">Client Name *</label>
                    <input className="input" name="name" required placeholder="e.g. Rahul Sharma" />
                  </div>
                  <div className="grid-2">
                    <div className="field">
                      <label className="field-label">Phone</label>
                      <input className="input" name="phone" placeholder="+91 98765 43210" />
                    </div>
                    <div className="field">
                      <label className="field-label">Company</label>
                      <input className="input" name="company" placeholder="e.g. BMW Delhi" />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Email</label>
                    <input className="input" name="email" type="email" placeholder="client@example.com" />
                  </div>
                  <div className="field">
                    <label className="field-label">Billing Address</label>
                    <input className="input" name="billing_address" placeholder="Nagpur / Delhi" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setQuickModalType(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Client</button>
                </div>
              </form>
            )}

            {quickModalType === 'shoot' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as any;
                let targetClientId = form.client_id?.value;

                if (!targetClientId && form.inline_client_name?.value) {
                  const newC = await addClient({
                    name: form.inline_client_name.value,
                    phone: form.inline_client_phone?.value || '',
                    email: '',
                    company: '',
                    billing_address: ''
                  });
                  targetClientId = newC.id;
                }

                if (!targetClientId) {
                  alert('Please select or specify a client for this shoot.');
                  return;
                }

                let finalShootType = form.shoot_type.value;
                if (finalShootType === '__CUSTOM__' && form.custom_shoot_type?.value) {
                  finalShootType = form.custom_shoot_type.value.trim();
                  try {
                    const saved = localStorage.getItem('studioos_custom_shoot_types');
                    const arr: string[] = saved ? JSON.parse(saved) : [];
                    if (!arr.includes(finalShootType)) {
                      arr.push(finalShootType);
                      localStorage.setItem('studioos_custom_shoot_types', JSON.stringify(arr));
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }

                addShoot({
                  title: form.title.value,
                  client_id: targetClientId,
                  shoot_date: form.shoot_date.value,
                  start_time: form.start_time.value,
                  end_time: '14:00',
                  location: form.location.value,
                  shoot_type: finalShootType,
                  amount: Number(form.amount.value) || 0,
                  status: 'Upcoming'
                });
                setQuickModalType(null);
                setQuickShootIsCustom(false);
                setCurrentPage('shoots');
              }}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="field">
                    <label className="field-label">Shoot Title *</label>
                    <input className="input" name="title" required placeholder="e.g. BMW X5 Handover Shoot" />
                  </div>

                  {clients.length === 0 ? (
                    <div style={{ background: 'var(--panel2)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>
                        No clients added yet. Enter client details below:
                      </div>
                      <div className="grid-2">
                        <div className="field">
                          <label className="field-label">Client Name *</label>
                          <input className="input" name="inline_client_name" required placeholder="e.g. Rahul Sharma" />
                        </div>
                        <div className="field">
                          <label className="field-label">Phone Number</label>
                          <input className="input" name="inline_client_phone" placeholder="+91 98765 43210" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid-2">
                      <div className="field">
                        <label className="field-label">Client *</label>
                        <select className="select" name="client_id" required defaultValue={clients[0]?.id}>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label className="field-label">Shoot Type</label>
                        <select
                          className="select"
                          name="shoot_type"
                          onChange={e => setQuickShootIsCustom(e.target.value === '__CUSTOM__')}
                        >
                          <option value="Car Delivery">Car Delivery</option>
                          <option value="Automotive Promo">Automotive Promo</option>
                          <option value="Brand Promo">Brand Promo</option>
                          <option value="Instagram Reel">Instagram Reel</option>
                          <option value="Wedding / Pre-Wedding">Wedding / Pre-Wedding</option>
                          <option value="Fashion / Lookbook">Fashion / Lookbook</option>
                          <option value="Corporate">Corporate</option>
                          <option value="Event">Event</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Music Video">Music Video</option>
                          <option value="Commercial Ad">Commercial Ad</option>
                          <option value="Photography">Photography</option>
                          <option value="Drone">Drone</option>
                          <option value="Other">Other</option>
                          <option value="__CUSTOM__"> + Add Custom Shoot Type...</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {clients.length === 0 && (
                    <div className="field">
                      <label className="field-label">Shoot Type</label>
                      <select
                        className="select"
                        name="shoot_type"
                        onChange={e => setQuickShootIsCustom(e.target.value === '__CUSTOM__')}
                      >
                        <option value="Car Delivery">Car Delivery</option>
                        <option value="Automotive Promo">Automotive Promo</option>
                        <option value="Brand Promo">Brand Promo</option>
                        <option value="Instagram Reel">Instagram Reel</option>
                        <option value="Wedding / Pre-Wedding">Wedding / Pre-Wedding</option>
                        <option value="Fashion / Lookbook">Fashion / Lookbook</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Event">Event</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Music Video">Music Video</option>
                        <option value="Commercial Ad">Commercial Ad</option>
                        <option value="Photography">Photography</option>
                        <option value="Drone">Drone</option>
                        <option value="Other">Other</option>
                        <option value="__CUSTOM__"> + Add Custom Shoot Type...</option>
                      </select>
                    </div>
                  )}

                  {quickShootIsCustom && (
                    <div className="field">
                      <label className="field-label" style={{ color: 'var(--accent)' }}>Enter Custom Shoot Type Name *</label>
                      <input
                        className="input"
                        style={{ borderColor: 'var(--accent)' }}
                        name="custom_shoot_type"
                        required
                        placeholder="e.g. Pre-Wedding Cinematic, Podcast Recording, Music Video..."
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="grid-2">
                    <div className="field">
                      <label className="field-label">Date *</label>
                      <input className="input" name="shoot_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="field">
                      <label className="field-label">Call Time</label>
                      <input className="input" name="start_time" type="time" defaultValue="11:00" />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="field">
                      <label className="field-label">Location *</label>
                      <input className="input" name="location" required placeholder="e.g. DLF Cyber City, Gurgaon" />
                    </div>
                    <div className="field">
                      <label className="field-label">Value (₹)</label>
                      <input className="input" name="amount" type="number" defaultValue="15000" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => { setQuickModalType(null); setQuickShootIsCustom(false); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Book Shoot</button>
                </div>
              </form>
            )}

            {quickModalType === 'quote' && (
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                  Opening the Quotation Builder with multi-item calculations...
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => {
                    setQuickModalType(null);
                    setCurrentPage('quotations');
                  }}
                >
                  Go to Quotations Builder
                </button>
              </div>
            )}

            {quickModalType === 'invoice' && (
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                  Opening the Invoices Engine...
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => {
                    setQuickModalType(null);
                    setCurrentPage('invoices');
                  }}
                >
                  Go to Invoices & Bills
                </button>
              </div>
            )}

            {quickModalType === 'payment' && (
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                  Select an invoice to record partial or full payment.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => {
                    setQuickModalType(null);
                    setCurrentPage('invoices');
                  }}
                >
                  View Invoices to Record Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
