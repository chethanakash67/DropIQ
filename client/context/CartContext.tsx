'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface CartItem {
    id: string | number;
    product_name: string;
    price_inr: number | string;
    image_url?: string;
    retailer_name?: string;
    affiliate_url?: string;
    store_phone?: string;
    is_offline: boolean;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    totalItems: number;
    addToCart: (product: Record<string, unknown>) => void;
    removeFromCart: (index: number) => void;
    updateQuantity: (index: number, change: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    showCart: boolean;
    setShowCart: (v: boolean) => void;
    notification: string | null;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('dropiq_cart');
            if (saved) setCart(JSON.parse(saved));
        } catch (_) { }
    }, []);

    const saveCart = useCallback((newCart: CartItem[]) => {
        setCart(newCart);
        localStorage.setItem('dropiq_cart', JSON.stringify(newCart));
    }, []);

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 2000);
    };

    const addToCart = useCallback((product: Record<string, unknown>) => {
        setCart(prev => {
            const existing = prev.find(
                item => item.id === product.id && item.retailer_name === (product.retailer_name ?? product.retailer)
            );
            let newCart: CartItem[];
            if (existing) {
                newCart = prev.map(item =>
                    item === existing ? { ...item, quantity: item.quantity + 1 } : item
                );
                showNotification('✅ Quantity updated in cart!');
            } else {
                const newItem: CartItem = {
                    id: (product.id as string | number),
                    product_name: (product.product_name ?? product.name) as string,
                    price_inr: (product.price_inr ?? product.price) as number,
                    image_url: (product.image_url ?? product.image) as string | undefined,
                    retailer_name: (product.retailer_name ?? product.retailer) as string | undefined,
                    affiliate_url: (product.affiliate_url ?? product.product_url ?? product.link) as string | undefined,
                    store_phone: product.store_phone as string | undefined,
                    is_offline: !!(product.is_offline_store),
                    quantity: 1,
                };
                newCart = [...prev, newItem];
                showNotification('✅ Added to cart!');
            }
            localStorage.setItem('dropiq_cart', JSON.stringify(newCart));
            return newCart;
        });
    }, []);

    const removeFromCart = useCallback((index: number) => {
        setCart(prev => {
            const newCart = prev.filter((_, i) => i !== index);
            localStorage.setItem('dropiq_cart', JSON.stringify(newCart));
            showNotification('🗑️ Removed from cart');
            return newCart;
        });
    }, []);

    const updateQuantity = useCallback((index: number, change: number) => {
        setCart(prev => {
            const newCart = [...prev];
            newCart[index] = { ...newCart[index], quantity: newCart[index].quantity + change };
            if (newCart[index].quantity <= 0) {
                newCart.splice(index, 1);
                showNotification('🗑️ Removed from cart');
            }
            localStorage.setItem('dropiq_cart', JSON.stringify(newCart));
            return newCart;
        });
    }, []);

    const clearCart = useCallback(() => {
        if (confirm('Are you sure you want to clear your cart?')) {
            saveCart([]);
            showNotification('🗑️ Cart cleared');
        }
    }, [saveCart]);

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => total + (parseFloat(String(item.price_inr)) || 0) * item.quantity, 0);
    }, [cart]);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, totalItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, showCart, setShowCart, notification }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be inside CartProvider');
    return ctx;
}
