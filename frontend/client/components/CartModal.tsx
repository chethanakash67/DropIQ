'use client';

import { useCart } from '@/context/CartContext';
import { IconCart, IconPhone, IconLink, IconTrash } from '@/components/Icons';

export default function CartModal() {
    const { cart, showCart, setShowCart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();

    if (!showCart) return null;

    const total = getCartTotal();

    return (
        <div className="modal-overlay-standard" onClick={(e) => { if (e.target === e.currentTarget) setShowCart(false); }}>
            <div className="modal-container-standard" style={{ maxWidth: '650px' }}>
                <button className="modal-close-btn" onClick={() => setShowCart(false)}>×</button>

                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                        <IconCart size={24} style={{ marginRight: 10, verticalAlign: 'middle' }} />
                        My Active Cart
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Items ready for purchase across partner stores.</p>
                </div>

                <div className="modal-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Your cart is empty.</p>
                        </div>
                    ) : (
                        cart.map((item, index) => {
                            const price = parseFloat(String(item.price_inr)) || 0;
                            const subtotal = price * item.quantity;
                            return (
                                <div key={`${item.id}-${index}`} className="modal-item-box">
                                    <div style={{ width: '90px', height: '90px', background: 'white', borderRadius: '16px', padding: '8px', border: '1px solid var(--border)', flexShrink: 0 }}>
                                        {item.image_url
                                            ? <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            : <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>No Image</div>
                                        }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.product_name}
                                        </h4>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Store: {item.retailer_name}</p>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                                            {item.store_phone ? (
                                                <a href={`tel:${item.store_phone}`} style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <IconPhone size={14} /> Call Store
                                                </a>
                                            ) : item.affiliate_url ? (
                                                <a href={item.affiliate_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <IconLink size={14} /> View Store
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '140px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '4px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, padding: '4px' }} onClick={() => updateQuantity(index, -1)}>-</button>
                                            <span style={{ fontSize: '14px', fontWeight: 700 }}>{item.quantity}</span>
                                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, padding: '4px' }} onClick={() => updateQuantity(index, 1)}>+</button>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{subtotal.toLocaleString('en-IN')}</div>
                                            <button onClick={() => removeFromCart(index)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Remove</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div style={{ marginTop: '32px', borderTop: '2px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>Total Amount</p>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: '#10b981', letterSpacing: '-1px' }}>₹{total.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            style={{ background: 'transparent', border: '1px solid #fee2e2', color: '#ef4444', padding: '12px 24px', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                            onClick={clearCart}
                        >
                            Clear Cart
                        </button>
                        <button 
                            className="shiny-shield-btn"
                            style={{ padding: '12px 32px', borderRadius: '14px', fontSize: '14px', fontWeight: 800 }}
                            onClick={() => setShowCart(false)}
                        >
                            CLOSE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
