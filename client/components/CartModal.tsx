'use client';

import { useCart } from '@/context/CartContext';

export default function CartModal() {
    const { cart, showCart, setShowCart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();

    if (!showCart) return null;

    const total = getCartTotal();

    return (
        <div className="cart-modal show" onClick={(e) => { if (e.target === e.currentTarget) setShowCart(false); }}>
            <div className="cart-modal-content">
                <div className="cart-header">
                    <h2>🛒 Your Cart</h2>
                    <button className="cart-close" onClick={() => setShowCart(false)}>×</button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart">Your cart is empty</div>
                    ) : (
                        cart.map((item, index) => {
                            const price = parseFloat(String(item.price_inr)) || 0;
                            const subtotal = price * item.quantity;
                            return (
                                <div key={`${item.id}-${index}`} className="cart-item">
                                    <div className="cart-item-image">
                                        {item.image_url
                                            ? <img src={item.image_url} alt={item.product_name} onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                                            : <div className="no-image">No Image</div>
                                        }
                                    </div>
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-name">{item.product_name}</h4>
                                        <p className="cart-item-store">Store: {item.retailer_name}</p>
                                        <p className="cart-item-price">₹{price.toLocaleString('en-IN')}</p>
                                        {item.store_phone
                                            ? <a href={`tel:${item.store_phone}`} className="cart-item-link cart-call-btn">📞 Call Store: {item.store_phone}</a>
                                            : item.affiliate_url
                                                ? <a href={item.affiliate_url} target="_blank" rel="noreferrer" className="cart-item-link">🔗 View Product</a>
                                                : null
                                        }
                                    </div>
                                    <div className="cart-item-quantity">
                                        <button className="qty-btn" onClick={() => updateQuantity(index, -1)}>-</button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => updateQuantity(index, 1)}>+</button>
                                    </div>
                                    <div className="cart-item-subtotal">
                                        <p>₹{subtotal.toLocaleString('en-IN')}</p>
                                        <button className="remove-btn" onClick={() => removeFromCart(index)}>🗑️</button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="cart-footer">
                    <div className="cart-total">
                        <strong>Total:</strong> ₹<span>{total.toLocaleString('en-IN')}</span>
                    </div>
                    <button className="cart-clear-btn" onClick={clearCart}>Clear Cart</button>
                </div>
            </div>
        </div>
    );
}
