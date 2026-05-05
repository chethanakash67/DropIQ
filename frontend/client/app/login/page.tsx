'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { IconWarning, IconEyeOpen, IconEyeClosed } from '@/components/Icons';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';

export default function LoginPage() {
    const router = useRouter();
    const { login, currentUser, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Force light theme for auth pages
        document.documentElement.setAttribute('data-theme', 'light');
        if (!loading && currentUser) router.replace('/dashboard');
        const urlError = new URLSearchParams(window.location.search).get('error');
        if (urlError) setError(urlError === 'google_failed' ? 'Google sign-in failed. Please try again.' : 'Sign-in failed. Please try again.');
    }, [loading, currentUser, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Please enter email and password'); return; }
        setSubmitting(true);
        try {
            await login(email, password);
            router.replace('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px' }}>
                <div style={{ 
                    width: '100%', 
                    maxWidth: '440px', 
                    background: 'white', 
                    borderRadius: '24px', 
                    padding: '48px', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(16, 185, 129, 0.1)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', letterSpacing: '-1px' }}>Welcome Back</h1>
                        <p style={{ color: '#64748b', marginTop: '8px' }}>Log in to access your personalized product discovery dashboard.</p>
                    </div>

                    {/* Google OAuth */}
                    <a
                        href="/api/auth/google"
                        className="google-button"
                        style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                            padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0',
                            background: 'white', color: '#1e293b', fontWeight: 500, textDecoration: 'none',
                            transition: 'all 0.2s', marginBottom: '24px'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </a>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0', color: '#94a3b8', fontSize: '13px' }}>
                        <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                        <span>OR SIGN IN WITH EMAIL</span>
                        <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {error && (
                            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: '12px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Email</label>
                            <input 
                                type="email" placeholder="you@example.com" required
                                value={email} onChange={e => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: '0.2s' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type={showPassword ? 'text' : 'password'} placeholder="••••••••" required
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: '0.2s' }}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(p => !p)}
                                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                >
                                    {showPassword ? <IconEyeClosed size={18} /> : <IconEyeOpen size={18} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            style={{ 
                                width: '100%', padding: '16px', background: '#10b981', color: 'white', 
                                border: 'none', borderRadius: '16px', fontWeight: 600, fontSize: '16px',
                                cursor: 'pointer', transition: 'all 0.2s', marginTop: '8px',
                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            {submitting ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '15px', color: '#64748b' }}>
                        Don&apos;t have an account? <span onClick={() => router.push('/signup')} style={{ color: '#10b981', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Create account</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
