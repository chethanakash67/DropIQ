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
        <div className="modal-overlay-standard" onClick={(e) => { if (e.target === e.currentTarget) setShowBag(false); }}>
            <div className="modal-container-standard">
                <button className="modal-close-btn" onClick={() => setShowBag(false)}>×</button>
                
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>My Saved Bag</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Items you bookmarked for later consideration.</p>
                </div>

                <div className="modal-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {bag.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Your bag is empty.</p>
                        </div>
                    ) : (
                        bag.map((item, index) => {
                            const price = parseFloat(String(item.price_inr)) || 0;
                            return (
                                <div key={`${item.id}-${index}`} className="modal-item-box">
                                    <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '16px', padding: '8px', border: '1px solid var(--border)', flexShrink: 0, cursor: 'pointer' }} onClick={() => {
                                        router.push(`/product/${item.id}?retailer=${encodeURIComponent(item.retailer_name || '')}`);
                                        setShowBag(false);
                                    }}>
                                        {item.image_url
                                            ? <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            : <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>No Image</div>
                                        }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => {
                                            router.push(`/product/${item.id}?retailer=${encodeURIComponent(item.retailer_name || '')}`);
                                            setShowBag(false);
                                        }}>
                                            {item.product_name}
                                        </h4>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Store: {item.retailer_name}</p>
                                        <p style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>₹{price.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
                                        <button 
                                            className="shiny-shield-btn" 
                                            onClick={() => handleMoveToCart(item, index)}
                                            style={{
                                                fontSize: '11px',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                width: '100%',
                                                fontWeight: 800,
                                                letterSpacing: '0.5px'
                                            }}
                                        >
                                            MOVE TO CART
                                        </button>
                                        <button 
                                            onClick={() => removeFromBag(index)}
                                            style={{
                                                fontSize: '11px',
                                                padding: '10px 14px',
                                                background: 'transparent',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontWeight: 800,
                                                width: '100%',
                                                letterSpacing: '0.5px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => (e.currentTarget.style.background = '#fef2f2')}
                                            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            REMOVE
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Items in your bag are synced to your account.</p>
                    <button 
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '8px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                        onClick={() => setShowBag(false)}
                    >
                        Close Bag
                    </button>
                </div>
            </div>
        </div>
    );
}
