'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    const { totalItems, setShowCart } = useCart();

    const name = currentUser?.fullName || currentUser?.email?.split('@')[0] || '';
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const avatarUrl = (currentUser as Record<string, unknown> | null)?.avatarUrl as string | undefined;

    return (
        <nav className="navbar">
            <div className="navbar-brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => window.location.href = '/'}>
                <img src="/dropiq-logo.png" alt="DropIQ" style={{ height: '48px', objectFit: 'contain' }} />
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>DropIQ</span>
            </div>

            <div className="navbar-actions">
                {name && <span className="navbar-greeting">Hi, {name.split(' ')[0]}!</span>}

                <button className="cart-button" onClick={() => setShowCart(true)}>
                    🛒
                    {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                </button>

                <div className="user-avatar">
                    {avatarUrl
                        ? <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" />
                        : initials || '?'
                    }
                </div>

                <button className="logout-button" onClick={logout}>Sign out</button>
            </div>
        </nav>
    );
}
