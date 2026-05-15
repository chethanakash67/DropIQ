'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string | number;
    product_name?: string;
    name?: string;
    price_inr?: number | string;
    image_url?: string;
    rating?: number | string;
    retailer_name?: string;
    affiliate_url?: string;
    product_url?: string;
    store_id?: string | number;
    last_updated?: string; // ISO string or undefined
}

export default function ProductCard({ product }: { product: Product }) {
    const router = useRouter();
    const { addToCart, addToBag } = useCart();

    const isOfflineStore = product.store_id !== undefined;
    const hasImage = product.image_url && product.image_url.trim() !== '';

    // Data freshness label logic - matches footer logic
    let freshnessLabel = '';
    if (product.last_updated) {
        const updatedDate = new Date(product.last_updated);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 20) {
            freshnessLabel = 'Updated a day ago';
        } else if (diffDays >= 20 && diffDays < 35) {
            freshnessLabel = 'Updated 4 days ago';
        } else {
            freshnessLabel = 'Updated 6 days ago';
        }
    } else {
        // Default label when no last_updated data
        freshnessLabel = 'Updated recently';
    }

    const viewProduct = () => {
        const id = product.id;
        const retailer = encodeURIComponent(product.retailer_name || '');
        
        // Save scroll position for restoration
        const currentPath = window.location.pathname;
        if (currentPath === '/dashboard') {
            sessionStorage.setItem('dashboardScroll', window.scrollY.toString());
        } else if (currentPath === '/results') {
            sessionStorage.setItem('resultsScroll', window.scrollY.toString());
        }
        
        router.push(`/product/${id}?retailer=${retailer}`);
    };

    return (
        <div className={`product-card ${isOfflineStore ? ' offline-store-product' : ''}`}>
            <div
                className={`store-status-flag ${isOfflineStore ? 'offline' : 'online'}`}
                title={isOfflineStore ? 'Offline Store' : 'Online Store'}
                aria-label={isOfflineStore ? 'Offline Store' : 'Online Store'}
            >
                {isOfflineStore ? 'Offline' : 'Online'}
            </div>
            <div className={`store-tag${isOfflineStore ? ' offline-tag' : ''}`}>
                {product.retailer_name}
            </div>

            <div className="product-card-image-wrap" onClick={viewProduct} style={{ cursor: 'pointer', marginBottom: '12px' }}>
                {hasImage
                    ? <img src={product.image_url} alt={product.product_name} className="product-image" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    : <div className="no-image-placeholder">No Image</div>
                }
            </div>

            <div className="product-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="product-name" onClick={viewProduct} style={{ cursor: 'pointer', marginBottom: '2px' }}>
                    {product.product_name || product.name}
                </div>
                {/* Data freshness label */}
                {freshnessLabel && (
                    <div style={{ 
                        fontSize: '10px', 
                        color: '#059669', 
                        marginBottom: '4px', 
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '12px',
                        width: 'fit-content'
                    }}>
                        <span style={{
                            width: '6px',
                            height: '6px',
                            background: '#10b981',
                            borderRadius: '50%',
                            display: 'inline-block'
                        }}></span>
                        {freshnessLabel}
                    </div>
                )}

                <div className="product-card-footer">
                    <div className="product-price">
                        {product.price_inr && !isNaN(Number(product.price_inr))
                            ? `₹${parseFloat(String(product.price_inr)).toLocaleString('en-IN')}`
                            : 'Visit store'}
                    </div>

                    {product.rating && (
                        <div className="product-rating">
                            Rating {product.rating}
                        </div>
                    )}
                </div>

                <div className="product-actions" style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="add-to-cart-btn-sm shiny-shield-btn" onClick={() => addToCart(product)} style={{ 
                            flex: 1,
                            padding: '10px 12px', 
                            fontSize: '11px',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Add to Cart
                        </button>
                        <button className="add-to-bag-btn-sm" onClick={() => addToBag(product)} style={{ 
                            flex: 1,
                            padding: '10px 12px', 
                            fontSize: '11px',
                            fontWeight: 500,
                            background: 'var(--bg-card)', 
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'all 0.3s'
                        }}>
                            Add to Bag
                        </button>
                    </div>
                    <button className="view-product-btn-full" onClick={viewProduct} style={{ 
                        width: '100%',
                        padding: '10px', 
                        fontSize: '11px',
                        fontWeight: 500,
                        background: 'rgba(16, 185, 129, 0.03)',
                        border: '1px solid rgba(16, 185, 129, 0.1)',
                        color: 'var(--accent)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s'
                    }}>
                        View Product
                    </button>
                </div>
            </div>
        </div>
    );
}
