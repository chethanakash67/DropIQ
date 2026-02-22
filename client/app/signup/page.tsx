'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
    const router = useRouter();
    const { signup, currentUser, loading } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && currentUser) router.replace('/dashboard');
    }, [loading, currentUser, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!fullName || !email || !password) { setError('Please fill all fields'); return; }
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            setError('Password must be ≥ 8 chars with uppercase, lowercase, and a number');
            return;
        }
        setSubmitting(true);
        try {
            await signup(fullName, email, password);
            router.replace('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="auth-wrapper">
            {/* Hero Side */}
            <aside className="auth-hero">
                <div className="auth-hero-content">
                    <div className="auth-hero-logo">DropIQ</div>
                    <p className="auth-hero-tagline">Join thousands finding their perfect products with AI precision.</p>
                    <div className="auth-hero-features">
                        {[
                            { icon: '⚡', text: 'Set up in under 60 seconds' },
                            { icon: '🔒', text: 'Secure and private by design' },
                            { icon: '🤖', text: 'AI that learns your preferences' },
                            { icon: '🆓', text: 'Free to use — always' },
                        ].map(f => (
                            <div key={f.text} className="auth-hero-feature">
                                <div className="auth-hero-feature-icon">{f.icon}</div>
                                <span>{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Form Side */}
            <div className="auth-side">
                <div className="auth-page">
                    <div className="auth-header">
                        <h1>Create account</h1>
                        <p>Start finding perfect products today</p>
                    </div>

                    {/* Google OAuth */}
                    <a
                        href="http://localhost:3001/api/auth/google"
                        className="google-button"
                        style={{ display: 'flex', marginBottom: '20px' }}
                    >
                        <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </a>

                    <div className="auth-divider">or create with email</div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && <div className="auth-error">⚠️ {error}</div>}

                        <div className="form-group">
                            <label htmlFor="signupName">Full Name</label>
                            <input id="signupName" type="text" placeholder="Jane Doe" required
                                value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="signupEmail">Email</label>
                            <input id="signupEmail" type="email" placeholder="you@example.com" required
                                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="signupPassword">Password</label>
                            <div className="password-field">
                                <input id="signupPassword" type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password" required
                                    value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <p className="password-requirements">Min 8 chars · uppercase · lowercase · number</p>
                        </div>

                        <button type="submit" className="auth-button" disabled={submitting}>
                            {submitting ? 'Creating Account…' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-toggle">
                        Already have an account?
                        <a onClick={() => router.push('/login')}>Sign in</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
