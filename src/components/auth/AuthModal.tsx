import React, { useState } from 'react';
import { Sparkles, Lock, Mail, User, ArrowRight, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, resetPassword, isDemoMode, setIsDemoMode } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.error) setErrorMsg(res.error);
        else onClose();
      } else if (mode === 'signup') {
        const res = await signUp(email, password, fullName);
        if (res.error) setErrorMsg(res.error);
        else {
          setSuccessMsg('Account created successfully! You are now logged in.');
          setTimeout(() => onClose(), 1200);
        }
      } else {
        const res = await resetPassword(email);
        if (res.error) setErrorMsg(res.error);
        else setSuccessMsg('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ width: '460px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--accent)" />
            <span style={{ fontWeight: 800, fontSize: '16px' }}>
              Studio<span style={{ color: 'var(--accent)' }}>OS</span> Auth
            </span>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMsg && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{ background: 'var(--ok-bg)', border: '1px solid var(--ok-border)', color: 'var(--ok)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                {successMsg}
              </div>
            )}

            {mode === 'signup' && (
              <div className="field">
                <label className="field-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    className="input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="Tejas (IconTejas Studio)"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="field">
              <label className="field-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  className="input"
                  type="email"
                  style={{ paddingLeft: '36px' }}
                  placeholder="tejas@icontejas.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="field">
                <label className="field-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    className="input"
                    type="password"
                    style={{ paddingLeft: '36px' }}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '8px' }} disabled={loading}>
              {loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In to StudioOS' : mode === 'signup' ? 'Create Studio Account' : 'Send Reset Link'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)', paddingTop: '10px' }}>
              {mode === 'signin' ? (
                <>
                  <button type="button" className="btn-ghost" style={{ padding: 0 }} onClick={() => setMode('signup')}>
                    Need an account? Sign up
                  </button>
                  <button type="button" className="btn-ghost" style={{ padding: 0 }} onClick={() => setMode('forgot')}>
                    Forgot password?
                  </button>
                </>
              ) : (
                <button type="button" className="btn-ghost" style={{ padding: 0 }} onClick={() => setMode('signin')}>
                  Back to Sign In
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
