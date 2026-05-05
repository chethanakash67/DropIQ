'use client';

import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function BagModal() {
    const { bag, showBag, setShowBag, removeFromBag, addToCart } = useCart();
    const router = useRouter();

    if (!showBag) return null;

    const handleMoveToCart = (item: CartItem, index: number) => {
        addToCart({ ...item });
        removeFromBag(index);
    };

    return (
        <div className="cart-modal show" onClick={(e) => { if (e.target === e.currentTarget) setShowBag(false); }}>
            <div className="cart-modal-content">
                <div className="cart-header">
                    <h2>My Bag</h2>
                    <button className="cart-close" onClick={() => setShowBag(false)}>×</button>
                </div>

                <div className="cart-items">
                    {bag.length === 0 ? (
                        <div className="empty-cart">Your bag is empty</div>
                    ) : (
                        bag.map((item, index) => {
                            const price = parseFloat(String(item.price_inr)) || 0;
                            return (
                                <div key={`${item.id}-${index}`} className="cart-item">
                                    <div className="cart-item-image" onClick={() => {
                                        router.push(`/product/${item.id}?retailer=${encodeURIComponent(item.retailer_name || '')}`);
                                        setShowBag(false);
                                    }} style={{ cursor: 'pointer' }}>
                                        {item.image_url
                                            ? <img src={item.image_url} alt={item.product_name} onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                                            : <div className="no-image">No Image</div>
                                        }
                                    </div>
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-name" onClick={() => {
                                            router.push(`/product/${item.id}?retailer=${encodeURIComponent(item.retailer_name || '')}`);
                                            setShowBag(false);
                                        }} style={{ cursor: 'pointer' }}>
                                            {item.product_name}
                                        </h4>
                                        <p className="cart-item-store">Store: {item.retailer_name}</p>
                                        <p className="cart-item-price">₹{price.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <button 
                                            className="move-to-cart-btn" 
                                            onClick={() => handleMoveToCart(item, index)}
                                            style={{
                                                fontSize: '11px',
                                                padding: '6px 10px',
                                                background: 'var(--gradient-vibrant)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            Move to Cart
                                        </button>
                                        <button 
                                            className="remove-from-bag-btn" 
                                            onClick={() => removeFromBag(index)}
                                            style={{
                                                fontSize: '11px',
                                                padding: '6px 10px',
                                                background: 'rgba(239, 68, 68, 0.05)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="cart-footer">
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Items in your bag are saved to your account.</p>
                    <button className="cart-clear-btn" onClick={() => setShowBag(false)}>Close Bag</button>
                </div>
            </div>
        </div>
    );
}
