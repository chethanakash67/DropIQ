'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import {
    IconCart, IconStore, IconPhone, IconArrowLeft,
    IconStar, IconTag, IconExternalLink, IconCheckCircle
} from '@/components/Icons';

interface Product {
    id: string | number;
    name?: string;
    product_name?: string;
    brand?: string;
    price_inr?: number | string;
    image_url?: string;
    rating?: number | string;
    reviews_count?: number;
    description?: string;
    features?: string[] | string;
    key_specs?: string[] | string;
    reviews?: Array<string | { text?: string; review?: string }> | string;
    specifications?: Record<string, unknown> | string;
    retailer_name?: string;
    merchant?: string;
    affiliate_url?: string;
    product_url?: string;
    availability_status?: string;
    store_id?: string | number;
    store_owner?: string;
    store_phone?: string;
    asin?: string;
    category?: string;
    [key: string]: unknown;
}

interface Comparison {
    name?: string;
    merchant: string;
    price_inr?: number;
    image_url?: string;
    affiliate_url?: string;
    product_url?: string;
}

function parseJson<T>(val: T[] | string | undefined | null): T[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val as string); } catch { return []; }
}

function parseSpecs(val: Record<string, unknown> | string | undefined | null): Record<string, string> {
    if (!val) return {};
    if (typeof val === 'object') return val as Record<string, string>;
    try { return JSON.parse(val as string); } catch { return {}; }
}

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const retailerHint = searchParams.get('retailer');
    const { currentUser, loading: authLoading, authenticatedFetch, setCurrentUser } = useAuth();
    const { addToCart, addToBag, totalItems, totalBagItems, setShowCart, setShowBag } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comparisons, setComparisons] = useState<Comparison[]>([]);
    const [compsLoading, setCompsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [recsLoading, setRecsLoading] = useState(false);
    const [cartAdded, setCartAdded] = useState(false);
    const [bagAdded, setBagAdded] = useState(false);
    const [showAllSpecs, setShowAllSpecs] = useState(false);

    useEffect(() => {
        if (!authLoading && !currentUser) router.replace('/login');
    }, [authLoading, currentUser, router]);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        const retailerQuery = retailerHint ? `?retailer=${encodeURIComponent(retailerHint)}` : '';
        fetch(`/api/products/${id}${retailerQuery}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) setProduct(d.product);
                else setError('Product not found');
            })
            .catch(() => setError('Failed to load product'))
            .finally(() => setLoading(false));
    }, [id, retailerHint]);

    useEffect(() => {
        if (!product) return;
        const retailer = (product.retailer_name || '').toLowerCase();
        const encodedRetailer = encodeURIComponent(retailer);
        
        // Fetch Comparisons
        setCompsLoading(true);
        fetch(`/api/products/${encodedRetailer}/${product.id}/price-comparisons`)
            .then(r => r.json())
            .then(d => { if (d.success) setComparisons(d.comparisons || []); })
            .catch(() => { })
            .finally(() => setCompsLoading(false));

        // Fetch Recommendations
        setRecsLoading(true);
        fetch(`/api/products/${encodedRetailer}/${product.id}/recommendations`)
            .then(r => r.json())
            .then(d => { if (d.success) setRecommendations(d.recommendations || []); })
            .catch(() => { })
            .finally(() => setRecsLoading(false));

    }, [product]);

    useEffect(() => {
        if (!product) return;
        // Track internal DropIQ product page visit for "System Settings" history
        try {
            const raw = localStorage.getItem('dropiq_product_history');
            const history = JSON.parse(raw || '[]');
            const entry = {
                id: product.id,
                name: product.product_name,
                image: product.image_url,
                retailer: product.retailer_name,
                price: product.price_inr,
                timestamp: new Date().toISOString()
            };
            const filtered = history.filter((p: any) => p.id !== product.id);
            localStorage.setItem('dropiq_product_history', JSON.stringify([entry, ...filtered].slice(0, 15)));
        } catch(e) {}
    }, [product]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product);
        setCartAdded(true);
        setTimeout(() => setCartAdded(false), 2000);
    };

    const handleAddToBag = () => {
        if (!product) return;
        addToBag(product);
        setBagAdded(true);
        setTimeout(() => setBagAdded(false), 2000);
    };

    if (authLoading || loading) return (
        <div className="product-detail-loading">
            <div className="spinner" />
            <p>Loading product...</p>
        </div>
    );

    if (error || !product) return (
        <div className="product-detail-error">
            <p>{error || 'Product not found'}</p>
            <button onClick={() => router.back()}>Go Back</button>
        </div>
    );

    const features = parseJson<string>(
        (product.features as string[] | string) || (product.key_specs as string[] | string)
    );
    const reviews = parseJson<string | { text?: string; review?: string }>(
        product.reviews as string[] | string
    );
    const specs = parseSpecs(product.specifications as Record<string, unknown> | string);
    const price = parseFloat(String(product.price_inr || product.price || 0));
    const rating = parseFloat(String(product.rating));
    const inStock = product.availability_status !== 'out_of_stock';

    const getAbsoluteUrl = (url: string | undefined): string => {
        if (!url) return '#';
        if (url.startsWith('http')) return url;
        return `https://${url}`;
    };

    const handleStoreClick = async () => {
        if (!currentUser || !product) return;

        // Track visited store locally for the "See visited stores" history with statistics
        try {
            const visitedRaw = localStorage.getItem('visited_stores_v2');
            const visited = JSON.parse(visitedRaw || '[]');
            const storeName = product.retailer_name || product.merchant || 'Unknown Store';
            
            let existing = visited.find((s: any) => s.name === storeName);
            if (existing) {
                existing.count = (existing.count || 0) + 1;
                existing.lastVisited = new Date().toISOString();
            } else {
                visited.push({ name: storeName, count: 1, lastVisited: new Date().toISOString() });
            }
            
            // Sort by most recent visit
            visited.sort((a: any, b: any) => new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime());
            localStorage.setItem('visited_stores_v2', JSON.stringify(visited.slice(0, 15)));
        } catch(e) {
            console.error("Failed to save visit history", e);
        }

        try {
            const res = await authenticatedFetch('/api/auth/me/increment-visits', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setCurrentUser({ ...currentUser, storeVisits: data.visits });
            }
        } catch (_) {}
    };

    return (
        <div className="product-detail-page">
            <Navbar />
            <div className="product-detail-topbar" style={{ marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <button className="back-button" onClick={() => router.back()}>
                    <IconArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Back to Results
                </button>
            </div>

            <div className="product-detail-layout">
                <div className="product-detail-left">
                    <div className="product-detail-image-wrap">
                        {product.image_url
                            ? <img src={product.image_url} alt={product.product_name} className="product-detail-image"
                                onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                            : <div className="no-image-placeholder-lg">No Image</div>
                        }
                    </div>

                    <div className="product-detail-store">
                        <IconStore size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        {product.retailer_name}
                    </div>

                    <div className={`stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                        <IconCheckCircle size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {inStock ? 'In Stock' : 'Out of Stock'}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className={`add-to-cart-btn-lg shiny-shield-btn ${cartAdded ? 'added' : ''}`}
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                style={{ 
                                    flex: 1,
                                    background: 'var(--gradient-vibrant)',
                                    border: 'none',
                                    padding: '14px',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                {cartAdded ? 'Added to Cart!' : 'Add to Cart'}
                            </button>
                            <button
                                className="add-to-bag-btn-lg"
                                onClick={handleAddToBag}
                                style={{ 
                                    flex: 1, 
                                    padding: '14px', 
                                    borderRadius: '16px', 
                                    border: 'none',
                                    background: 'var(--gradient-vibrant)',
                                    fontWeight: 500,
                                    color: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    opacity: 0.9
                                }}
                            >
                                {bagAdded ? 'Added to Bag!' : 'Add to Bag'}
                            </button>
                        </div>

                        {(product.affiliate_url || product.product_url) && (
                            <a
                                href={getAbsoluteUrl(product.affiliate_url || product.product_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="view-on-store-btn"
                                style={{ width: '100%', textAlign: 'center' }}
                                onClick={handleStoreClick}
                            >
                                View on {product.retailer_name}
                            </a>
                        )}
                    </div>
                </div>

                <div className="product-detail-right">
                    {product.brand && <div className="product-detail-brand">{product.brand}</div>}
                    <h1 className="product-detail-title">{product.product_name}</h1>

                    <div className="product-detail-meta">
                        <div className="product-detail-price">
                            {!isNaN(price) && price > 0
                                ? <>
                                    <IconTag size={16} style={{ marginRight: 4, verticalAlign: 'middle', color: '#059669' }} />
                                    ₹{price.toLocaleString('en-IN')}
                                  </>
                                : 'Visit website for price'}
                        </div>
                        {product.rating && !isNaN(rating) && (
                            <div className="product-detail-rating">
                                <IconStar size={15} style={{ marginRight: 4, verticalAlign: 'middle', color: '#f59e0b' }} />
                                <strong>{rating.toFixed(1)}</strong>
                                <span style={{ opacity: 0.6 }}> / 5.0</span>
                                {product.reviews_count && (
                                    <span className="reviews-count">({product.reviews_count.toLocaleString()} reviews)</span>
                                )}
                            </div>
                        )}
                    </div>

                    {features.length > 0 && (
                        <div className="product-detail-section">
                            <h3>Key Features</h3>
                            <ul className="product-detail-features">
                                {features.map((f, i) => (
                                    <li key={i}>
                                        <IconCheckCircle size={13} style={{ marginRight: 8, color: '#059669', flexShrink: 0 }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {Object.keys(specs).length > 0 && (
                        <div className="product-detail-section">
                            <h3>Specifications</h3>
                            <div className="product-detail-specs-grid">
                                {Object.entries(specs).slice(0, showAllSpecs ? undefined : 5).map(([key, value]) => (
                                    <div key={key} className="spec-item">
                                        <span className="spec-label">{key}</span>
                                        <span className="spec-value">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                            {Object.keys(specs).length > 5 && (
                                <button
                                    onClick={() => setShowAllSpecs(!showAllSpecs)}
                                    style={{
                                        marginTop: '12px',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        padding: '4px 0'
                                    }}
                                >
                                    {showAllSpecs ? 'View Less' : 'View More'}
                                </button>
                            )}
                        </div>
                    )}

                    <div className="product-detail-section" id="compare">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h3 style={{ margin: 0 }}>Know How Much You&apos;ll Save</h3>
                            <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>Cross-Store Comparison</span>
                        </div>
                        {compsLoading
                            ? <p style={{ opacity: 0.6, fontSize: 14 }}>Searching other stores...</p>
                            : comparisons.length === 0
                                ? <p style={{ opacity: 0.5, fontSize: 14 }}>No other listings found</p>
                                : <div className="comparison-list">
                                    {comparisons.map((c, i) => {
                                        const savings = price - (c.price_inr || 0);
                                        const linkUrl = getAbsoluteUrl(c.affiliate_url || c.product_url);
                                        return (
                                            <div key={i} className="comparison-row">
                                                <span className="comp-merchant">{c.merchant}</span>
                                                <span className="comp-price">
                                                    ₹{c.price_inr?.toLocaleString('en-IN') ?? 'N/A'}
                                                </span>
                                                <span className="comp-savings" style={{ margin: 0 }}>Save ₹{Math.abs(savings).toLocaleString('en-IN')}</span>
                                                <a 
                                                    href={linkUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="comp-visit"
                                                    onClick={handleStoreClick}
                                                    style={{ 
                                                        marginLeft: 'auto',
                                                        padding: '6px 12px', 
                                                        background: 'var(--accent)', 
                                                        color: 'white', 
                                                        borderRadius: '8px',
                                                        textDecoration: 'none',
                                                        fontSize: '12px',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Visit
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                        }
                    </div>

                    {recommendations.length > 0 && (
                        <div className="product-detail-section">
                            <h3>Recommended For You</h3>
                            <div className="detail-recommendations-list">
                                {recommendations.map((rec, i) => (
                                    <div key={i} className="detail-rec-item" onClick={() => router.push(`/product/${rec.id}?retailer=${encodeURIComponent(rec.merchant || rec.retailer_name || '')}`)}>
                                        <img src={rec.image_url} alt={rec.name || rec.product_name || ''} className="detail-rec-image" />
                                        <div className="detail-rec-info">
                                            <div className="detail-rec-name">{rec.name}</div>
                                            <div className="detail-rec-price">₹{rec.price_inr?.toLocaleString('en-IN')}</div>
                                            <div className="detail-rec-merchant">{rec.merchant}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {reviews.length > 0 && (
                        <div className="product-detail-section">
                            <h3>Customer Stories</h3>
                            <div className="product-detail-reviews">
                                {reviews.slice(0, 5).map((r, i) => (
                                    <div key={i} className="review-card">
                                        <IconStar size={12} style={{ color: '#f59e0b', marginRight: 6 }} />
                                        &ldquo;{typeof r === 'string' ? r : (r.text || r.review || '')}&rdquo;
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
