'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface Product {
    id: string | number;
    product_name?: string;
    name?: string;
    price_inr?: number | string;
    image_url?: string;
    rating?: number | string;
    features?: string[] | string;
    key_specs?: string[] | string;
    reviews?: Array<string | { text?: string; review?: string }> | string;
    retailer_name?: string;
    affiliate_url?: string;
    product_url?: string;
    store_id?: string | number;
    store_owner?: string;
    store_phone?: string;
    [key: string]: unknown;
}

interface Recommendation {
    image_url?: string;
    name: string;
    price_inr?: number;
    merchant: string;
    affiliate_url?: string;
    product_url?: string;
}

interface Comparison {
    image_url?: string;
    name?: string;
    merchant: string;
    price_inr?: number;
    affiliate_url?: string;
    product_url?: string;
}

function parseJson<T>(val: T[] | string | undefined): T[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val as string); } catch { return []; }
}

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const isOfflineStore = product.store_id !== undefined;
    const hasImage = product.image_url && product.image_url.trim() !== '';

    const features = parseJson<string>(product.features as unknown as string[] | string || product.key_specs as unknown as string[] | string);
    const reviews = parseJson<string | { text?: string; review?: string }>(product.reviews as unknown as string[] | string);

    const [showRecs, setShowRecs] = useState(false);
    const [recsLoading, setRecsLoading] = useState(false);
    const [recs, setRecs] = useState<Recommendation[]>([]);
    const [recsLoaded, setRecsLoaded] = useState(false);

    const [showComps, setShowComps] = useState(false);
    const [compsLoading, setCompsLoading] = useState(false);
    const [comps, setComps] = useState<Comparison[]>([]);
    const [compsLoaded, setCompsLoaded] = useState(false);
    const mainPrice = parseFloat(String(product.price_inr)) || 0;

    const toggleRecommendations = async () => {
        if (showRecs) { setShowRecs(false); return; }
        setShowRecs(true);
        if (recsLoaded) return;
        setRecsLoading(true);
        try {
            const retailer = (product.retailer_name || '').toLowerCase();
            const res = await fetch(`/api/products/${retailer}/${product.id}/recommendations`);
            const data = await res.json();
            if (data.success) setRecs(data.recommendations || []);
        } catch (_) { }
        setRecsLoading(false);
        setRecsLoaded(true);
    };

    const toggleComparisons = async () => {
        if (showComps) { setShowComps(false); return; }
        setShowComps(true);
        if (compsLoaded) return;
        setCompsLoading(true);
        try {
            const retailer = (product.retailer_name || '').toLowerCase();
            const res = await fetch(`/api/products/${retailer}/${product.id}/price-comparisons`);
            const data = await res.json();
            if (data.success) setComps(data.comparisons || []);
        } catch (_) { }
        setCompsLoading(false);
        setCompsLoaded(true);
    };

    return (
        <div className={`product-card${isOfflineStore ? ' offline-store-product' : ''}`}>
            <div className={`store-tag${isOfflineStore ? ' offline-tag' : ''}`}>
                {isOfflineStore ? '🏪 ' : ''}{product.retailer_name}
            </div>

            {isOfflineStore && product.store_owner && (
                <div className="store-owner-tag">
                    👤 {product.store_owner}{product.store_phone ? ` • 📞 ${product.store_phone}` : ''}
                </div>
            )}

            {hasImage
                ? <img src={product.image_url} alt={product.product_name} className="product-image" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                : <div className="no-image-placeholder">No Image</div>
            }

            <div className="product-name">{product.product_name}</div>

            <div className="product-price">
                {product.price_inr && !isNaN(Number(product.price_inr))
                    ? `₹${parseFloat(String(product.price_inr)).toLocaleString('en-IN')}`
                    : 'Visit website for price'}
            </div>

            {product.rating && (
                <div className="product-rating">
                    <span className="rating-value">★ {product.rating}</span> / 5.0
                </div>
            )}

            {features.length > 0 && (
                <div className="product-features">
                    <h4>Key Features:</h4>
                    <ul>{features.slice(0, 3).map((f, i) => <li key={i}>• {f}</li>)}</ul>
                </div>
            )}

            {reviews.length > 0 && (
                <div className="product-reviews">
                    <h4>Top Reviews:</h4>
                    {reviews.slice(0, 3).map((r, i) => (
                        <div key={i} className="review-item">
                            &ldquo;{typeof r === 'string' ? r : (r.text || r.review || '')}&rdquo;
                        </div>
                    ))}
                </div>
            )}

            <div className="product-actions">
                <button className="add-to-cart-btn" onClick={() => addToCart(product as Record<string, unknown>)}>
                    🛒 Add to Cart
                </button>

                {!isOfflineStore && (product.affiliate_url || product.product_url) && (
                    <a href={product.affiliate_url || product.product_url} target="_blank" rel="noreferrer" className="product-link">
                        View Product →
                    </a>
                )}

                {isOfflineStore && (
                    <div className="offline-store-info">
                        <span className="badge">Available In-Store</span>
                        {product.store_phone && (
                            <a href={`tel:${product.store_phone}`} className="call-store-btn">📞 Call Store</a>
                        )}
                    </div>
                )}

                {!isOfflineStore && (
                    <>
                        <button className="recommendations-btn" onClick={toggleRecommendations}>
                            {showRecs ? 'Hide Recommendations' : 'Show Recommendations'}
                        </button>
                        <button className="price-comparison-btn" onClick={toggleComparisons}>
                            {showComps ? 'Hide other stores' : "Know How much you'll save"}
                        </button>
                    </>
                )}
            </div>

            {/* Recommendations */}
            {showRecs && !isOfflineStore && (
                <div className="recommendations-container">
                    <div className="recommendations-header">
                        <h4>Recommended Products</h4>
                        <button className="close-recommendations" onClick={() => setShowRecs(false)}>✕</button>
                    </div>
                    {recsLoading
                        ? <div className="recommendations-loading">Loading recommendations...</div>
                        : recs.length === 0
                            ? <div className="no-recommendations">No recommendations available</div>
                            : <div className="recommendations-list">
                                {recs.map((rec, i) => (
                                    <div key={i} className="recommendation-item">
                                        {rec.image_url
                                            ? <img src={rec.image_url} alt={rec.name} className="recommendation-image" />
                                            : <div className="no-image-placeholder-small">No Image</div>
                                        }
                                        <div className="recommendation-details">
                                            <div className="recommendation-name">{rec.name}</div>
                                            <div className="recommendation-price">
                                                {rec.price_inr && !isNaN(rec.price_inr) ? `₹${rec.price_inr.toLocaleString('en-IN')}` : 'Price not disclosed'}
                                            </div>
                                            <div className="recommendation-merchant">{rec.merchant}</div>
                                        </div>
                                        <a href={rec.affiliate_url || rec.product_url} target="_blank" rel="noreferrer" className="recommendation-link">View →</a>
                                    </div>
                                ))}
                            </div>
                    }
                </div>
            )}

            {/* Price Comparisons */}
            {showComps && !isOfflineStore && (
                <div className="price-comparisons-container">
                    <div className="price-comparisons-header">
                        <h4>Price Comparisons - Find the Best Deal</h4>
                        <button className="close-price-comparisons" onClick={() => setShowComps(false)}>✕</button>
                    </div>
                    {compsLoading
                        ? <div className="price-comparisons-loading">Searching for best prices...</div>
                        : comps.length === 0
                            ? <div className="no-comparisons">No price comparisons available</div>
                            : <div className="price-comparisons-list">
                                {comps.map((comp, i) => {
                                    const savings = mainPrice - (comp.price_inr || 0);
                                    const savingsText = savings > 0 ? `saved: ₹${Math.abs(savings).toLocaleString('en-IN')}`
                                        : savings < 0 ? `costs ₹${Math.abs(savings).toLocaleString('en-IN')} more` : '';
                                    return (
                                        <div key={i} className="comparison-item">
                                            {comp.image_url
                                                ? <img src={comp.image_url} alt={comp.name} className="comparison-image" />
                                                : <div className="no-image-placeholder-tiny">No Image</div>
                                            }
                                            <div className="comparison-details">
                                                <div className="comparison-merchant">{comp.merchant}</div>
                                                <div className="comparison-price">₹{comp.price_inr?.toLocaleString('en-IN') ?? 'N/A'}</div>
                                                {savingsText && <div className="comparison-savings">{savingsText}</div>}
                                            </div>
                                            <a href={comp.affiliate_url || comp.product_url} target="_blank" rel="noreferrer" className="comparison-visit-btn">Link</a>
                                        </div>
                                    );
                                })}
                            </div>
                    }
                </div>
            )}
        </div>
    );
}
