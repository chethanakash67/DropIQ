'use client';

import { useCart } from '@/context/CartContext';

export default function CartNotification() {
    const { notification } = useCart();
    if (!notification) return null;
    return <div className="cart-notification">{notification}</div>;
}
