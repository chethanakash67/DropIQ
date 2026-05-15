'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function LandingNavbar() {
    const { currentUser } = useAuth();
    const { totalItems, totalBagItems, setShowCart, setShowBag } = useCart();

    const name = currentUser?.fullName || currentUser?.email?.split('@')[0] || '';
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const avatarUrl = (currentUser as Record<string, unknown> | null)?.avatarUrl as string | undefined;
    const isProLikeUser = currentUser?.planType === 'pro' || currentUser?.planType === 'max' || currentUser?.planType === 'premium';

    return (
        <nav className="navbar">
            <div className="navbar-brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href={currentUser ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <img src="/dropiq-logo-black.png" alt="DropIQ" style={{ height: '38px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-1.2px' }}>DropIQ</span>
                    {isProLikeUser && (
                        <span title="Pro Plan" style={{ marginLeft: 4, display: 'flex', alignItems: 'center' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 18L6.5 7L12 13L17.5 7L20 18H4Z" fill="#FFD166" stroke="#E0A800" strokeWidth="1.2"/>
                                <circle cx="6.5" cy="6.2" r="1.2" fill="#FFD166"/>
                                <circle cx="12" cy="12.2" r="1.2" fill="#FFD166"/>
                                <circle cx="17.5" cy="6.2" r="1.2" fill="#FFD166"/>
                            </svg>
                        </span>
                    )}
                </Link>
            </div>

            <div className="navbar-actions">
                {currentUser ? (
                    <>
                        {name && <span className="navbar-greeting" style={{ fontSize: '13px' }}>Hi, {name.split(' ')[0]}!</span>}
                        <span style={{ fontSize: '13px', color: '#FFD700', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginLeft: '8px', marginRight: '12px' }}>
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#FFD700" /></svg>
                            {currentUser.credits ?? 0}
                        </span>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button className="navbar-text-action" onClick={() => setShowBag(true)} style={{ fontWeight: 500 }}>
                                My Bag {totalBagItems > 0 && <span className="count-badge accent-badge">{totalBagItems}</span>}
                            </button>
                            <button className="navbar-text-action" onClick={() => setShowCart(true)} style={{ fontWeight: 500 }}>
                                My Cart {totalItems > 0 && <span className="count-badge">{totalItems}</span>}
                            </button>
                        </div>
                        <Link href="/profile" className="user-avatar-link">
                            <div className="user-avatar" title="My Profile">
                                {avatarUrl
                                    ? <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" />
                                    : initials || '?'
                                }
                            </div>
                        </Link>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href="/login" className="navbar-text-action" style={{ textDecoration: 'none' }}>
                            Log In
                        </Link>
                        <Link href="/signup" style={{
                            padding: '9px 18px',
                            borderRadius: '14px',
                            background: 'rgba(255, 255, 255, 0.16)',
                            border: '1px solid rgba(255, 255, 255, 0.24)',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
