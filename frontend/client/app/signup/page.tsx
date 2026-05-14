'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { IconEyeOpen, IconEyeClosed } from '@/components/Icons';
import LandingNavbar from '@/components/LandingNavbar';
import AuthLottieLoader from '@/components/AuthLottieLoader';

export default function SignupPage() {
    const router = useRouter();
    const { signup, verifyEmailOtp, resendVerificationOtp, currentUser, loading } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationEmail, setVerificationEmail] = useState('');
    const [verificationRequired, setVerificationRequired] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [devOtp, setDevOtp] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        // Force light theme for auth pages
        document.documentElement.setAttribute('data-theme', 'light');
        if (!loading && currentUser) router.replace('/dashboard');
    }, [loading, currentUser, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');

        if (verificationRequired) {
            if (!otp) { setError('Enter the verification code'); return; }
            setSubmitting(true);
            try {
                await verifyEmailOtp(verificationEmail || email, otp);
                sessionStorage.setItem('just_logged_in', 'true');
                router.replace('/dashboard');
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Verification failed');
                setSubmitting(false);
            }
            return;
        }

        if (!fullName || !email || !password) { setError('Please fill all fields'); return; }
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            setError('Password must be ≥ 8 chars with uppercase, lowercase, and a number');
            return;
        }
        setSubmitting(true);
        try {
            const result = await signup(fullName, email, password);
            if (result.requiresVerification) {
                setVerificationRequired(true);
                setVerificationEmail(result.email || email);
                setInfo(result.message || 'We sent a verification code to your email.');
                setDevOtp(result.devOtp || '');
                setSubmitting(false);
                return;
            }
            sessionStorage.setItem('just_logged_in', 'true');
            router.replace('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed');
            setSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setInfo('');
        setResending(true);
        try {
            const result = await resendVerificationOtp(verificationEmail || email);
            setInfo(result.message || 'A new verification code was sent.');
            setDevOtp(result.devOtp || '');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to resend code');
        } finally {
            setResending(false);
        }
    };

    if (loading) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            {submitting && (
                <AuthLottieLoader message={verificationRequired ? 'Verifying your account...' : 'Creating your account...'} />
            )}
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
                        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', letterSpacing: '-1px' }}>
                            {verificationRequired ? 'Verify Email' : 'Create Account'}
                        </h1>
                        <p style={{ color: '#64748b', marginTop: '8px' }}>
                            {verificationRequired
                                ? `Enter the code sent to ${verificationEmail || email}.`
                                : 'Join DropiQ to discover the most reasonable prices for any product.'}
                        </p>
                    </div>

                    {/* Google OAuth */}
                    {!verificationRequired && (
                        <>
                            <a
                                href="/api/auth/google"
                                className="google-button"
                                onClick={() => setSubmitting(true)}
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
                                Sign up with Google
                            </a>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0', color: '#94a3b8', fontSize: '13px' }}>
                                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                                <span>OR SIGN UP WITH EMAIL</span>
                                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                            </div>
                        </>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {error && (
                            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: '12px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}
                        {info && (
                            <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #d1fae5', color: '#047857', borderRadius: '12px', fontSize: '14px' }}>
                                {info}
                            </div>
                        )}
                        {(devOtp || (process.env.NODE_ENV === 'development' && verificationRequired)) && (
                            <div style={{ 
                                padding: '16px', 
                                background: '#fffbeb', 
                                border: '2px dashed #fde68a', 
                                color: '#92400e', 
                                borderRadius: '16px', 
                                fontSize: '14px',
                                textAlign: 'center',
                                marginBottom: '10px'
                            }}>
                                <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px', opacity: 0.7 }}>Development Mode Code</div>
                                <strong style={{ fontSize: '24px', letterSpacing: '4px' }}>{devOtp || 'Check Server Logs'}</strong>
                            </div>
                        )}

                        {!verificationRequired ? (
                            <>
                                <div className="form-group">
                                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Full Name</label>
                                    <input
                                        type="text" placeholder="Jane Doe" required
                                        value={fullName} onChange={e => setFullName(e.target.value)}
                                        style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: '0.2s' }}
                                    />
                                </div>

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
                                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Min 8 chars, uppercase, lowercase, and a number</p>
                                </div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Verification Code</label>
                                <input 
                                    type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="123456" required
                                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: '0.2s', letterSpacing: '8px', fontWeight: 700, textAlign: 'center' }}
                                />
                            </div>
                        )}

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
                            {submitting
                                ? (verificationRequired ? 'Verifying...' : 'Creating account...')
                                : (verificationRequired ? 'Verify & Continue' : 'Create Account')}
                        </button>
                    </form>

                    {verificationRequired && (
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={resending}
                            style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: resending ? 'not-allowed' : 'pointer' }}
                        >
                            {resending ? 'Sending...' : 'Resend code'}
                        </button>
                    )}

                    {!verificationRequired && (
                        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '15px', color: '#64748b' }}>
                            Already have an account? <span onClick={() => router.push('/login')} style={{ color: '#10b981', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Sign in</span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
