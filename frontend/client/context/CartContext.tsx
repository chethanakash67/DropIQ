'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

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

export interface CartProductInput {
    id?: string | number;
    product_name?: string;
    name?: string;
    price_inr?: number | string;
    price?: number | string;
    image_url?: string;
    image?: string;
    retailer_name?: string;
    retailer?: string;
    affiliate_url?: string;
    product_url?: string;
    link?: string;
    store_phone?: string;
    is_offline_store?: boolean;
}

interface CartContextType {
    cart: CartItem[];
    bag: CartItem[];
    totalItems: number;
    totalBagItems: number;
    addToCart: (product: CartProductInput) => void;
    removeFromCart: (index: number) => void;
    updateQuantity: (index: number, change: number) => void;
    clearCart: () => void;
    clearBag: () => void;
    getCartTotal: () => number;
    
    addToBag: (product: CartProductInput) => void;
    removeFromBag: (index: number) => void;
    
    showCart: boolean;
    setShowCart: (v: boolean) => void;
    showBag: boolean;
    setShowBag: (v: boolean) => void;
    
    notification: string | null;
    syncWithBackend: () => Promise<void>;
    fetchFromBackend: () => Promise<void>;
    clearLocalData: () => void;
}

interface BackendCartItem extends Record<string, unknown> {
    product_id: string | number;
    price: number | string;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [bag, setBag] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [showBag, setShowBag] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 2000);
    };

    // Initial Load - Only if not logged in or as a starting point
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('dropiq_cart');
            if (savedCart) setCart(JSON.parse(savedCart));
            
            const savedBag = localStorage.getItem('dropiq_bag');
            if (savedBag) setBag(JSON.parse(savedBag));
        } catch (_) { }
    }, []);

    const fetchFromBackend = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const [cartRes, bagRes] = await Promise.all([
                fetch('/api/auth/me/cart', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/auth/me/bag', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (cartRes.ok) {
                const cartData = await cartRes.json();
                const items = (Array.isArray(cartData.items) ? cartData.items : []).map((item: BackendCartItem) => ({
                    ...item,
                    id: item.product_id,
                    price_inr: item.price
                }));
                setCart(items);
                localStorage.setItem('dropiq_cart', JSON.stringify(items));
            }

            if (bagRes.ok) {
                const bagData = await bagRes.json();
                const items = (Array.isArray(bagData.items) ? bagData.items : []).map((item: BackendCartItem) => ({
                    ...item,
                    id: item.product_id,
                    price_inr: item.price
                }));
                setBag(items);
                localStorage.setItem('dropiq_bag', JSON.stringify(items));
            }
        } catch (err) {
            console.error('Failed to fetch from backend', err);
        }
    }, []);

    const syncWithBackend = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            await Promise.all([
                fetch('/api/auth/me/cart/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ items: cart })
                }),
                fetch('/api/auth/me/bag/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ items: bag })
                })
            ]);
        } catch (err) {
            console.error('Failed to sync with backend', err);
        }
    }, [cart, bag]);

    const clearLocalData = useCallback(() => {
        setCart([]);
        setBag([]);
        localStorage.removeItem('dropiq_cart');
        localStorage.removeItem('dropiq_bag');
    }, []);

    const { currentUser } = useAuth();
    
    useEffect(() => {
        if (currentUser) {
            fetchFromBackend();
        } else {
            clearLocalData();
        }
    }, [currentUser, fetchFromBackend, clearLocalData]);

    useEffect(() => {
        if (!currentUser) return;
        const timer = setTimeout(() => {
            syncWithBackend();
        }, 2000); 
        return () => clearTimeout(timer);
    }, [cart, bag, currentUser, syncWithBackend]);

    const addToCart = useCallback((product: CartProductInput) => {
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
        setCart([]);
        localStorage.setItem('dropiq_cart', JSON.stringify([]));
        showNotification('🗑️ Cart cleared');
    }, []);

    const clearBag = useCallback(() => {
        setBag([]);
        localStorage.setItem('dropiq_bag', JSON.stringify([]));
        showNotification('🗑️ Bag cleared');
    }, []);

    const addToBag = useCallback((product: CartProductInput) => {
        setBag(prev => {
            const existing = prev.find(
                item => item.id === product.id && item.retailer_name === (product.retailer_name ?? product.retailer)
            );
            if (existing) {
                showNotification('ℹ️ Already in Bag');
                return prev;
            }
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
            const newBag = [...prev, newItem];
            localStorage.setItem('dropiq_bag', JSON.stringify(newBag));
            showNotification('💼 Added to Bag!');
            return newBag;
        });
    }, []);

    const removeFromBag = useCallback((index: number) => {
        setBag(prev => {
            const newBag = prev.filter((_, i) => i !== index);
            localStorage.setItem('dropiq_bag', JSON.stringify(newBag));
            showNotification('🗑️ Removed from Bag');
            return newBag;
        });
    }, []);

    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => total + (parseFloat(String(item.price_inr)) || 0) * item.quantity, 0);
    }, [cart]);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalBagItems = bag.length;

    return (
        <CartContext.Provider value={{ 
            cart, bag, totalItems, totalBagItems, addToCart, removeFromCart, updateQuantity, clearCart, clearBag, getCartTotal, 
            addToBag, removeFromBag,
            showCart, setShowCart, showBag, setShowBag,
            notification, syncWithBackend, fetchFromBackend, clearLocalData
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be inside CartProvider');
    return ctx;
}
