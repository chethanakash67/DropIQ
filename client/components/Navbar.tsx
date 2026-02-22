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
            <span className="navbar-brand">DropIQ</span>

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
