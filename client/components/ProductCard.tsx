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
    [key: string]: unknown;
}

export default function ProductCard({ product }: { product: Product }) {
    const router = useRouter();
    const { addToCart } = useCart();
    const isOfflineStore = product.store_id !== undefined;
    const hasImage = product.image_url && product.image_url.trim() !== '';

    const viewProduct = () => {
        const id = product.id;
        const retailer = encodeURIComponent(product.retailer_name || '');
        router.push(`/product/${id}?retailer=${retailer}`);
    };

    return (
        <div className={`product-card ${isOfflineStore ? ' offline-store-product' : ''}`}>
            <div className={`store-tag${isOfflineStore ? ' offline-tag' : ''}`}>
                {isOfflineStore ? '🏪 ' : ''}{product.retailer_name}
            </div>

            <div className="product-card-image-wrap">
                {hasImage
                    ? <img src={product.image_url} alt={product.product_name} className="product-image" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    : <div className="no-image-placeholder">No Image</div>
                }
            </div>

            <div className="product-card-body">
                <div className="product-name">{product.product_name || product.name}</div>

                <div className="product-card-footer">
                    <div className="product-price">
                        {product.price_inr && !isNaN(Number(product.price_inr))
                            ? `₹${parseFloat(String(product.price_inr)).toLocaleString('en-IN')}`
                            : 'Visit store'}
                    </div>

                    {product.rating && (
                        <div className="product-rating">
                            ★ {product.rating}
                        </div>
                    )}
                </div>

                <div className="product-actions" style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    <button className="add-to-cart-btn shiny-shield-btn" onClick={() => addToCart(product as Record<string, unknown>)} style={{ padding: '8px 12px', fontSize: '12px' }}>
                        Add to Cart
                    </button>
                    <button className="view-product-btn" onClick={viewProduct} style={{ 
                        padding: '8px 12px', 
                        fontSize: '12px',
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}>
                        View Product
                    </button>
                </div>
            </div>
        </div>
    );
}
