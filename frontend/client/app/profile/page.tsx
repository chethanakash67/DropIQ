'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import PremiumAlert from '@/components/PremiumAlert';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
    const { currentUser, setCurrentUser, authenticatedFetch, logout, loading } = useAuth();
    const { cart, bag, removeFromCart, removeFromBag, updateQuantity } = useCart();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('details');
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        preferences: '',
        themePreference: 'light'
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [alertConfig, setAlertConfig] = useState<{ 
        isOpen: boolean; 
        title: string; 
        message: string; 
        onConfirm?: () => void; 
        type?: 'danger' | 'warning' | 'info' | 'success';
        confirmText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
    });

    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showVisitedModal, setShowVisitedModal] = useState(false);
    const [visitedHistory, setVisitedHistory] = useState<any[]>([]);
    const [productHistory, setProductHistory] = useState<any[]>([]);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !currentUser) {
            router.push('/login');
            return;
        }

        if (currentUser) {
            setForm({
                fullName: currentUser.fullName || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                address: currentUser.address || '',
                preferences: currentUser.preferences || '',
                themePreference: currentUser.themePreference || 'light'
            });
            document.documentElement.setAttribute('data-theme', currentUser.themePreference || 'light');
        }

        // Load visited stores history (v2 with stats)
        const history = JSON.parse(localStorage.getItem('visited_stores_v2') || '[]');
        setVisitedHistory(history);

        // Load DropIQ product history
        const pHistory = JSON.parse(localStorage.getItem('dropiq_product_history') || '[]');
        setProductHistory(pHistory);
    }, [currentUser, loading, router]);

    useEffect(() => {
        const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const actualProfileUpdate = async () => {
        setIsSaving(true);
        setStatus(null);

        try {
            const { email, ...payload } = form;
            const res = await authenticatedFetch('/api/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setCurrentUser({ ...currentUser!, ...data.user });
                setAlertConfig({
                    isOpen: true,
                    title: 'Update Successful',
                    message: 'Your profile details have been securely updated.',
                    type: 'success',
                    confirmText: 'Great'
                });
            } else {
                const err = await res.json();
                setAlertConfig({
                    isOpen: true,
                    title: 'Update Failed',
                    message: err.error || 'We could not update your profile at this time.',
                    type: 'danger'
                });
            }
        } catch (err) {
            setAlertConfig({
                isOpen: true,
                title: 'Connection Error',
                message: 'Unable to reach the server. Please check your internet.',
                type: 'danger'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setAlertConfig({
            isOpen: true,
            title: 'Save Changes?',
            message: 'This will update your primary account details across all DropIQ services.',
            type: 'warning',
            confirmText: 'Save Details',
            onConfirm: actualProfileUpdate
        });
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setAlertConfig({
                isOpen: true,
                title: 'Passwords Don\'t Match',
                message: 'Your new password and confirmation password are different. Please try again.',
                type: 'warning',
                confirmText: 'Got it'
            });
            return;
        }

        setIsSaving(true);
        try {
            const res = await authenticatedFetch('/api/auth/me/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            if (res.ok) {
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setAlertConfig({
                    isOpen: true,
                    title: '🔐 Password Changed',
                    message: 'Your password has been updated successfully. Keep it safe!',
                    type: 'success',
                    confirmText: 'Perfect'
                });
            } else {
                const err = await res.json();
                setAlertConfig({
                    isOpen: true,
                    title: 'Password Update Failed',
                    message: err.error || 'We could not update your password. Please check your current password and try again.',
                    type: 'danger',
                    confirmText: 'Try Again'
                });
            }
        } catch (err) {
            setAlertConfig({
                isOpen: true,
                title: 'Connection Error',
                message: 'Unable to reach the server. Please check your connection.',
                type: 'danger'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearData = async () => {
        try {
            const res = await authenticatedFetch('/api/auth/me/data', { method: 'DELETE' });
            if (res.ok) {
                localStorage.removeItem('dropiq_cart');
                localStorage.removeItem('dropiq_bag');
                localStorage.removeItem('visited_stores');
                localStorage.removeItem('visited_stores_v2');
                localStorage.removeItem('dropiq_product_history');
                setAlertConfig({
                    isOpen: true,
                    title: 'Data Cleared',
                    message: 'All your shopping data has been removed. The page will now refresh.',
                    type: 'success',
                    onConfirm: () => window.location.reload()
                });
            } else {
                setAlertConfig({
                    isOpen: true,
                    title: 'Error',
                    message: 'Failed to clear your data. Please try again.',
                    type: 'danger'
                });
            }
        } catch (_) {
            setAlertConfig({
                isOpen: true,
                title: 'Connection Error',
                message: 'Failed to reach the server.',
                type: 'danger'
            });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const res = await authenticatedFetch('/api/auth/me', { method: 'DELETE' });
            if (res.ok) {
                setAlertConfig({
                    isOpen: true,
                    title: 'Account Deleted',
                    message: 'Your account has been permanently removed. You will now be logged out.',
                    type: 'success',
                    onConfirm: logout
                });
            } else {
                setAlertConfig({
                    isOpen: true,
                    title: 'Deletion Failed',
                    message: 'We could not delete your account. Please contact support.',
                    type: 'danger'
                });
            }
        } catch (_) {
            setAlertConfig({
                isOpen: true,
                title: 'Connection Error',
                message: 'Failed to reach the server.',
                type: 'danger'
            });
        }
    };

    if (loading || !currentUser) return null;

    const navItems = [
        { id: 'details', label: 'User Details' },
        { id: 'settings', label: 'System Settings' },
        { id: 'orders', label: 'Marketplace Redirects' },
        { id: 'bag', label: 'My Bag', count: bag.length },
        { id: 'cart', label: 'My Cart', count: cart.length },
    ];

    return (
        <div className="dashboard profile-page-root">
            <Navbar />
            
            <div className="container" style={{ paddingTop: '20px' }}>
                <Link href="/dashboard" scroll={false} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px', transition: 'color 0.3s' }}>
                    ← Back to Dashboard
                </Link>
            </div>
            
            <div className="container" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: isMobile ? '16px' : '40px', minHeight: '80vh', padding: isMobile ? '12px' : undefined }}>

                {isMobile && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gradient-vibrant)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '3px solid var(--bg-card)' }}>{currentUser.fullName?.[0] || 'U'}</div>
                            <div style={{ lineHeight: 1 }}>
                                <div style={{ fontWeight: 700 }}>{currentUser.fullName || 'User'}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button aria-label="Open settings menu" onClick={() => setMenuOpen(!menuOpen)} style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', padding: '8px' }}>
                                <span style={{ height: '2px', background: 'var(--text-primary)', display: 'block' }} />
                                <span style={{ height: '2px', background: 'var(--text-primary)', display: 'block' }} />
                                <span style={{ height: '2px', background: 'var(--text-primary)', display: 'block' }} />
                            </button>
                            {menuOpen && (
                                <div style={{ position: 'absolute', right: 0, top: '52px', width: '220px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px', boxShadow: '0 12px 30px rgba(0,0,0,0.12)', zIndex: 40 }}>
                                    {navItems.map(item => (
                                        <button key={item.id} onClick={() => { setActiveTab(item.id); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab === item.id ? 700 : 500 }}>
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SIDEBAR */}
                {!isMobile && (
                <aside className="profile-sidebar" style={{ 
                    background: 'var(--bg-card)', 
                    borderRadius: '24px', 
                    padding: '24px', 
                    border: '1px solid var(--border)',
                    height: 'fit-content',
                    position: 'sticky',
                    top: '40px'
                }}>
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-vibrant)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '4px solid var(--bg-card)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                            {currentUser.fullName?.[0] || 'U'}
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{currentUser.fullName || 'User'}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentUser.email}</p>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {navItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setStatus(null); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: activeTab === item.id ? 'var(--border)' : 'transparent',
                                    color: activeTab === item.id ? 'var(--accent-hover)' : 'var(--text-primary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: activeTab === item.id ? 800 : 500,
                                    fontSize: activeTab === item.id ? '16px' : '14px',
                                    textAlign: 'left',
                                    textDecoration: 'none',
                                    opacity: 1
                                }}
                            >
                                {item.label}
                                {item.count !== undefined && (
                                    <span style={{ 
                                        fontSize: '11px', 
                                        background: activeTab === item.id ? 'var(--accent)' : 'var(--bg-secondary)',
                                        color: activeTab === item.id ? 'white' : 'var(--text-muted)',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontWeight: 800,
                                        marginLeft: 'auto'
                                    }}>{item.count}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>
                )}

                {/* CONTENT AREA */}
                <main className="profile-content">
                    {status && (
                        <div style={{ 
                            marginBottom: '24px', 
                            padding: '16px 24px',
                            borderRadius: '16px',
                            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            color: status.type === 'success' ? '#10b981' : '#ef4444',
                            fontSize: '14px'
                        }}>
                            {status.msg}
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="tab-view animate-fade-in">
                            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>User Details</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Personal information and contact details.</p>
                            
                            <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', background: 'var(--bg-card)', padding: isMobile ? '20px' : '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="Your full name" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address (Primary)</label>
                                    <input value={form.email} disabled style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 99999 00000" />
                                </div>
                                <div className="form-group">
                                    <label>Location / Address</label>
                                    <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="State, City, Pincode" />
                                </div>
                                <div style={{ gridColumn: isMobile ? 'auto' : 'span 2', marginTop: '12px', display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-start' }}>
                                    <button type="submit" className="shiny-shield-btn" style={{ padding: '16px 32px', width: 'auto', borderRadius: '16px', fontWeight: 500 }} disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Profile Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="tab-view animate-fade-in">
                            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>System Settings</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Configure your application experience and account.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* THEME SECTION */}
                                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Personalization</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-card)', borderRadius: '16px' }}>
                                        <div>
                                            <h4 style={{ fontWeight: 600, fontSize: '14px' }}>Theme Preference</h4>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Choose between light and dark modes.</p>
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                const newTheme = form.themePreference === 'dark' ? 'light' : 'dark';
                                                setForm({...form, themePreference: newTheme});
                                                // document.documentElement.setAttribute('data-theme', newTheme); // Handled by AuthContext useEffect
                                                
                                                // Auto-save theme
                                                const res = await authenticatedFetch('/api/auth/me', {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ themePreference: newTheme })
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    setCurrentUser({ ...currentUser!, themePreference: newTheme });
                                                    localStorage.setItem('themePreference', newTheme);
                                                }
                                            }}
                                            style={{ 
                                                width: '60px', height: '30px', borderRadius: '20px', 
                                                background: form.themePreference === 'dark' ? 'var(--accent)' : '#cbd5e1',
                                                position: 'relative', border: 'none', cursor: 'pointer', transition: '0.3s'
                                            }}
                                        >
                                            <div style={{ 
                                                width: '22px', height: '22px', borderRadius: '50%', background: 'white',
                                                position: 'absolute', top: '4px', left: form.themePreference === 'dark' ? '34px' : '4px', transition: '0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>

                                {/* APPS AND PASSWORDS SECTION */}
                                <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Apps and Passwords</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Keep your account secure by updating your password regularly.</p>
                                    
                                    <form onSubmit={handlePasswordUpdate} style={{ maxWidth: '400px' }}>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ fontSize: '12px' }}>Current Password</label>
                                            <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} placeholder="••••••••" required />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ fontSize: '12px' }}>New Password</label>
                                            <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} placeholder="••••••••" required minLength={8} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '20px' }}>
                                            <label style={{ fontSize: '12px' }}>Confirm New Password</label>
                                            <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} placeholder="••••••••" required />
                                        </div>
                                        <button type="submit" className="auth-button" style={{ background: '#334155', borderRadius: '12px', padding: '12px', fontSize: '13px' }} disabled={isSaving}>
                                            {isSaving ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                </div>

                                {/* ACCOUNT ACTIONS SECTION */}
                                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)', marginBottom: '32px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Account & Data Actions</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button 
                                            onClick={() => setAlertConfig({
                                                isOpen: true,
                                                title: 'Sign Out?',
                                                message: 'Are you sure you want to sign out from this device?',
                                                type: 'warning',
                                                confirmText: 'Sign Out',
                                                onConfirm: logout
                                            })}
                                            style={{ textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px 0', fontSize: '14px', fontWeight: 500 }}
                                        >
                                            → Sign Out from this device
                                        </button>
                                        <button 
                                            onClick={() => setAlertConfig({
                                                isOpen: true,
                                                title: 'Clear Shopping Data?',
                                                message: 'This will remove all items from your cart and saved bag. This action cannot be undone.',
                                                type: 'danger',
                                                confirmText: 'Clear Everything',
                                                onConfirm: handleClearData
                                            })}
                                            style={{ textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px 0', fontSize: '14px', fontWeight: 500 }}
                                        >
                                            → Clear All Shopping Data
                                        </button>
                                        <button 
                                            onClick={() => setAlertConfig({
                                                isOpen: true,
                                                title: 'Delete Account?',
                                                message: 'We are sorry to see you go. This will permanently delete your account and all associated data. This cannot be undone.',
                                                type: 'danger',
                                                confirmText: 'Delete Forever',
                                                onConfirm: handleDeleteAccount
                                            })}
                                            style={{ textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px 0', fontSize: '14px', fontWeight: 500 }}
                                        >
                                            → Delete My Account Forever
                                        </button>
                                    </div>
                                </div>

                                {/* PRODUCT VISIT HISTORY SECTION */}
                                 <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', width: '100%', overflow: 'hidden' }}>
                                     <div style={{ marginBottom: '24px' }}>
                                         <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>Product Visit History</h3>
                                         <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Last {productHistory.length} products you viewed on DropIQ.</p>
                                     </div>
                                     
                                    {productHistory.length === 0 ? (
                                         <div style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                                             <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No internal product visits yet.</p>
                                         </div>
                                     ) : (
                                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                             {(isHistoryExpanded ? productHistory : productHistory.slice(0, 2)).map((p, i) => (
                                                 <div key={i} onClick={() => router.push(`/product/${p.id}?retailer=${encodeURIComponent(p.retailer || '')}`)} style={{ 
                                                     display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '16px', 
                                                     background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', transition: '0.2s',
                                                     width: '100%', minWidth: 0, boxSizing: 'border-box'
                                                 }} className="modal-item-box-hover">
                                                     <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
                                                        <img src={p.image} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                     </div>
                                                     <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                                                         <div style={{ 
                                                             fontSize: '14px', 
                                                             fontWeight: 700, 
                                                             color: 'var(--text-primary)', 
                                                             width: '100%',
                                                             lineHeight: '1.4',
                                                             display: '-webkit-box',
                                                             WebkitLineClamp: 2,
                                                             WebkitBoxOrient: 'vertical',
                                                             overflow: 'hidden'
                                                         }}>
                                                             {p.name}
                                                         </div>
                                                         <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                             {p.retailer} • ₹{p.price}
                                                         </div>
                                                     </div>
                                                     <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0, background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>VIEWED</div>
                                                 </div>
                                             ))}
                                             
                                             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                                                 {!isHistoryExpanded && productHistory.length > 2 && (
                                                     <button 
                                                        onClick={() => setIsHistoryExpanded(true)}
                                                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                     >
                                                        View All ({productHistory.length})
                                                     </button>
                                                 )}
                                                 {isHistoryExpanded && (
                                                     <button 
                                                        onClick={() => setIsHistoryExpanded(false)}
                                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                     >
                                                        Show Less
                                                     </button>
                                                 )}
                                                 <button 
                                                    onClick={(e) => { e.stopPropagation(); setAlertConfig({
                                                            isOpen: true,
                                                            title: 'Clear History?',
                                                            message: 'This will remove all products from your visit history locally.',
                                                            type: 'danger',
                                                            confirmText: 'Clear History',
                                                            onConfirm: () => {
                                                                localStorage.removeItem('dropiq_product_history');
                                                                setProductHistory([]);
                                                            }
                                                        }); }}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                 >
                                                    Clear History
                                                 </button>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                            </div>
                        </div>
                    )}


                    {activeTab === 'bag' && (
                        <div className="tab-view animate-fade-in">
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                    <div>
                                        <button 
                                            className="shiny-shield-btn"
                                            style={{ 
                                                padding: isMobile ? '8px 12px' : '10px 18px', 
                                                borderRadius: isMobile ? '12px' : '16px', 
                                                fontSize: isMobile ? '12px' : '14px', 
                                                fontWeight: 600,
                                                opacity: 0.6,
                                                cursor: 'not-allowed',
                                                pointerEvents: 'none',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Checkout All at Once <span style={{ fontSize: isMobile ? '9px' : '10px', marginLeft: '6px' }}>(Soon)</span>
                                        </button>
                                    </div>
                                    <div>
                                        <button 
                                            style={{ 
                                                padding: isMobile ? '8px 12px' : '10px 18px', 
                                                borderRadius: isMobile ? '12px' : '16px', 
                                                fontSize: isMobile ? '12px' : '14px', 
                                                fontWeight: 600,
                                                border: '1px solid #fee2e2', 
                                                background: '#fef2f2', 
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                whiteSpace: 'nowrap'
                                            }}
                                            onClick={() => {
                                                if (confirm('Clear all items from your bag?')) {
                                                    // Clear bag logic
                                                    localStorage.removeItem('dropiq_bag');
                                                    window.location.reload(); 
                                                }
                                            }}
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginTop: '12px' }}>
                                    <h2 style={{ fontSize: isMobile ? '18px' : '24px', margin: 0, lineHeight: 1.05 }}>My Saved Bag</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '12px' : '14px', margin: '8px 0 0' }}>Items you've bookmarked for later.</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                                {bag.length === 0 ? (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                                        <p style={{ color: 'var(--text-muted)' }}>Your bag is empty.</p>
                                    </div>
                                ) : (
                                    bag.map((item, idx) => (
                                        <div key={idx} style={{ 
                                            background: 'var(--bg-card)', 
                                            borderRadius: '20px', 
                                            padding: '20px', 
                                            border: '1px solid var(--border)', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            gap: '12px',
                                            transition: 'var(--transition)'
                                        }}>
                                            <div style={{ position: 'relative', width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img src={item.image_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                <button 
                                                    onClick={() => removeFromBag(idx)} 
                                                    style={{ 
                                                        position: 'absolute', top: '-5px', right: '-5px', 
                                                        border: '1px solid var(--border)', background: 'var(--bg-card)', color: '#ef4444', 
                                                        width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                                    }}>×</button>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '14px', fontWeight: 500, lineHeight: '1.4', marginBottom: '8px', minHeight: '40px' }}>{item.product_name}</h4>
                                                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent)', marginBottom: '16px' }}>₹{item.price_inr}</div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                                                <button 
                                                    className="shiny-shield-btn"
                                                    onClick={() => router.push(`/product/${item.id}?retailer=${encodeURIComponent(item.retailer_name || '')}`)}
                                                    style={{ width: '100%', padding: '10px', fontSize: '12px', borderRadius: '10px' }}
                                                >
                                                    View Item
                                                </button>
                                                <button 
                                                    className="shiny-shield-btn"
                                                    style={{ width: '100%', padding: '10px', fontSize: '12px', borderRadius: '10px', opacity: 0.6, cursor: 'not-allowed', pointerEvents: 'none' }}
                                                >
                                                    Checkout <span style={{ fontSize: '10px' }}>(Soon)</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'cart' && (
                        <div className="tab-view animate-fade-in">
                            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>My Active Cart</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Ready to purchase items.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {cart.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                                        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Your cart is empty.</p>
                                    </div>
                                ) : (
                                    cart.map((item, idx) => (
                                        <div key={idx} style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '20px', border: '1px solid var(--border)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <img src={item.image_url} alt="" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '15px', fontWeight: 600 }}>{item.product_name}</h4>
                                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Store: {item.retailer_name}</p>
                                                <div style={{ fontWeight: 600, color: 'var(--accent)', marginTop: '4px' }}>₹{item.price_inr}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <button onClick={() => updateQuantity(idx, -1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>-</button>
                                                <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(idx, 1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>+</button>
                                            </div>
                                            <button onClick={() => removeFromCart(idx)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', marginLeft: '10px' }}>Remove</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="tab-view animate-fade-in" style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px' }}>Marketplace Redirects</h2>
                            <p style={{ color: 'var(--text-muted)', marginTop: '12px', maxWidth: '450px', margin: '12px auto 0', fontSize: '15px', lineHeight: '1.6' }}>
                                Track your discovery journey. See exactly how many products you&apos;ve explored across our partner stores.
                            </p>
                            <div style={{ marginTop: '48px', fontSize: '72px', fontWeight: 900, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-2px' }}>{currentUser?.storeVisits || 0}</div>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '48px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Total Discoveries</p>
                            
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                <button 
                                    className="shiny-shield-btn" 
                                    style={{ padding: '14px 32px', borderRadius: '16px', fontSize: '14px', fontWeight: 700 }} 
                                    onClick={() => router.push('/dashboard')}
                                >
                                    Start Exploring
                                </button>
                                <button 
                                    className="shiny-shield-btn" 
                                    onClick={() => {
                                        const history = JSON.parse(localStorage.getItem('visited_stores_v2') || '[]');
                                        setVisitedHistory(history);
                                        setShowVisitedModal(true);
                                    }}
                                    style={{ 
                                        padding: '14px 32px', 
                                        borderRadius: '16px', 
                                        fontSize: '14px', 
                                        fontWeight: 700, 
                                        background: 'var(--bg-secondary)', 
                                        color: 'var(--text-primary)', 
                                        border: '1px solid var(--border)',
                                        boxShadow: 'none'
                                    }}
                                >
                                    Stores Explored
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* VISITED STORES MODAL */}
            {showVisitedModal && (
                <div className="modal-overlay-standard" onClick={() => setShowVisitedModal(false)}>
                    <div className="modal-container-standard" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowVisitedModal(false)}>×</button>
                        
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>Marketplace Analytics</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Deep dive into your store discovery statistics.</p>
                        </div>
                        
                        {visitedHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No store interactions recorded yet.</p>
                            </div>
                        ) : (
                            <div className="visited-stores-list">
                                {visitedHistory.map((store, i) => (
                                    <div key={i} className="modal-item-box" style={{ justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{store.name}</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last redirect: {new Date(store.lastVisited).toLocaleDateString()}</span>
                                        </div>
                                        <div className="store-visit-badge">
                                            <span className="store-visit-count">{store.count || 1}</span>
                                            <span className="store-visit-label">Products</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '32px', textAlign: 'center', lineHeight: '1.6' }}>
                            These statistics help us understand your preferences to provide better personalized deals and cross-store price comparisons.
                        </p>
                    </div>
                </div>
            )}
            <PremiumAlert 
                isOpen={alertConfig.isOpen}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                confirmText={alertConfig.confirmText}
                onConfirm={alertConfig.onConfirm}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
            />
        </div>
    );
}
