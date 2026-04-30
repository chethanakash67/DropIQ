'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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
    }, [currentUser, loading, router]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const confirmSave = window.confirm('Save changes to your profile? This will update your primary account details.');
        if (!confirmSave) return;

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
                setStatus({ type: 'success', msg: 'Profile updated correctly in database!' });
            } else {
                const err = await res.json();
                setStatus({ type: 'error', msg: `${err.error || 'Update failed'}` });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: '❌ Connection error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setStatus({ type: 'error', msg: '❌ New passwords do not match' });
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
                setStatus({ type: 'success', msg: 'Password changed successfully!' });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const err = await res.json();
                setStatus({ type: 'error', msg: `${err.error || 'Password update failed'}` });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: '❌ Connection error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearData = async () => {
        if (!window.confirm('Are you sure you want to clear all shopping data? This will empty your cart and bag permanently.')) return;
        
        try {
            const res = await authenticatedFetch('/api/auth/me/data', { method: 'DELETE' });
            if (res.ok) {
                localStorage.removeItem('dropiq_cart');
                localStorage.removeItem('dropiq_bag');
                window.location.reload();
            } else {
                alert('Failed to clear data');
            }
        } catch (_) {
            alert('Connection error');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('CRITICAL: Are you sure you want to delete your account? This action is permanent and cannot be undone.')) return;
        if (!window.confirm('Type "DELETE" in the next prompt to confirm.')) return;
        const confirmStr = window.prompt('Please type DELETE to confirm:');
        if (confirmStr !== 'DELETE') return;

        try {
            const res = await authenticatedFetch('/api/auth/me', { method: 'DELETE' });
            if (res.ok) {
                alert('Account deleted. You will be logged out.');
                logout();
            } else {
                alert('Failed to delete account');
            }
        } catch (_) {
            alert('Connection error');
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
            
            <div className="container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px', minHeight: '80vh' }}>
                
                {/* SIDEBAR */}
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
                            
                            <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
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
                                <div style={{ gridColumn: 'span 2', marginTop: '12px' }}>
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
                                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Account & Data Actions</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button 
                                            onClick={logout}
                                            style={{ textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px 0', fontSize: '14px', fontWeight: 500 }}
                                        >
                                            → Sign Out from this device
                                        </button>
                                        <button 
                                            onClick={handleClearData}
                                            style={{ textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px 0', fontSize: '14px', fontWeight: 500 }}
                                        >
                                            → Clear All Shopping Data
                                        </button>
                                        <button 
                                            onClick={handleDeleteAccount}
                                            style={{ textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px 0', fontSize: '14px', fontWeight: 500 }}
                                        >
                                            → Delete My Account Forever
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {activeTab === 'bag' && (
                        <div className="tab-view animate-fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>My Saved Bag</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Items you've bookmarked for later.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                    <button 
                                        className="shiny-shield-btn"
                                        style={{ 
                                            padding: '12px 28px', 
                                            borderRadius: '16px', 
                                            fontSize: '14px', 
                                            fontWeight: 600,
                                            opacity: 0.6,
                                            cursor: 'not-allowed',
                                            pointerEvents: 'none'
                                        }}
                                    >
                                        Checkout All at Once <span style={{ fontSize: '10px' }}>(Soon)</span>
                                    </button>
                                    <button 
                                        style={{ 
                                            padding: '12px 28px', 
                                            borderRadius: '16px', 
                                            fontSize: '14px', 
                                            fontWeight: 600,
                                            border: '1px solid #fee2e2', 
                                            background: '#fef2f2', 
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
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
                        <div className="tab-view animate-fade-in" style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Marketplace Redirects</h2>
                            <p style={{ color: 'var(--text-muted)', marginTop: '10px', maxWidth: '400px', margin: '10px auto 0' }}>
                                This track shows the number of products you've visited from our platform to their original store listings.
                            </p>
                            <div style={{ marginTop: '40px', fontSize: '48px', fontWeight: 900, color: 'var(--accent)' }}>{currentUser?.storeVisits || 0}</div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '30px' }}>Total Store Visits</p>
                            <button className="shiny-shield-btn" style={{ padding: '12px 32px', borderRadius: '12px' }} onClick={() => router.push('/dashboard')}>Start Exploring</button>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}

