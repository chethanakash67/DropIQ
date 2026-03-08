'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
    IconCart, IconStore, IconPhone, IconArrowLeft,
    IconStar, IconTag, IconExternalLink, IconCheckCircle
} from '@/components/Icons';

interface Product {
    id: string | number;
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
    const id = params.id as string;
    const { currentUser, loading: authLoading } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comparisons, setComparisons] = useState<Comparison[]>([]);
    const [compsLoading, setCompsLoading] = useState(false);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (!authLoading && !currentUser) router.replace('/login');
    }, [authLoading, currentUser, router]);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`/api/products/${id}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) setProduct(d.product);
                else setError('Product not found');
            })
            .catch(() => setError('Failed to load product'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!product) return;
        const retailer = (product.retailer_name || '').toLowerCase();
        setCompsLoading(true);
        fetch(`/api/products/${retailer}/${product.id}/price-comparisons`)
            .then(r => r.json())
            .then(d => { if (d.success) setComparisons(d.comparisons || []); })
            .catch(() => { })
            .finally(() => setCompsLoading(false));
    }, [product]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product as Record<string, unknown>);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
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
    const price = parseFloat(String(product.price_inr));
    const rating = parseFloat(String(product.rating));
    const inStock = product.availability_status !== 'out_of_stock';

    return (
        <div className="product-detail-page">
            {/* Top bar */}
            <div className="product-detail-topbar">
                <button className="back-button" onClick={() => router.back()}>
                    <IconArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Back to Results
                </button>
            </div>

            <div className="product-detail-layout">
                {/* Left: image + actions */}
                <div className="product-detail-left">
                    <div className="product-detail-image-wrap">
                        {product.image_url
                            ? <img src={product.image_url} alt={product.product_name} className="product-detail-image"
                                onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                            : <div className="no-image-placeholder-lg">No Image</div>
                        }
                    </div>

                    {/* Store badge */}
                    <div className="product-detail-store">
                        <IconStore size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        {product.retailer_name}
                    </div>

                    {/* Stock status */}
                    <div className={`stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                        <IconCheckCircle size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {inStock ? 'In Stock' : 'Out of Stock'}
                    </div>

                    {/* CTA buttons */}
                    <button
                        className={`add-to-cart-btn-lg ${added ? 'added' : ''}`}
                        onClick={handleAddToCart}
                        disabled={!inStock}
                    >
                        <IconCart size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        {added ? 'Added to Cart!' : 'Add to Cart'}
                    </button>

                    {(product.affiliate_url || product.product_url) && (
                        <a
                            href={product.affiliate_url || product.product_url}
                            target="_blank"
                            rel="noreferrer"
                            className="view-on-store-btn"
                        >
                            <IconExternalLink size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            View on {product.retailer_name}
                        </a>
                    )}
                </div>

                {/* Right: details */}
                <div className="product-detail-right">
                    {product.brand && <div className="product-detail-brand">{product.brand}</div>}
                    <h1 className="product-detail-title">{product.product_name}</h1>

                    {/* Price + Rating row */}
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

                    {/* Description */}
                    {product.description && (
                        <div className="product-detail-section">
                            <h3>Description</h3>
                            <p className="product-detail-description">{product.description}</p>
                        </div>
                    )}

                    {/* Key Features */}
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

                    {/* Specifications */}
                    {Object.keys(specs).length > 0 && (
                        <div className="product-detail-section">
                            <h3>Specifications</h3>
                            <div className="product-detail-specs">
                                {Object.entries(specs).map(([k, v]) => (
                                    typeof v === 'string' || typeof v === 'number' ? (
                                        <div key={k} className="spec-row">
                                            <span className="spec-key">{k}</span>
                                            <span className="spec-val">{v}</span>
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    {reviews.length > 0 && (
                        <div className="product-detail-section">
                            <h3>Customer Reviews</h3>
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

                    {/* Price Comparisons */}
                    <div className="product-detail-section" id="compare">
                        <h3>Price Comparison</h3>
                        {compsLoading
                            ? <p style={{ opacity: 0.6, fontSize: 14 }}>Searching other stores...</p>
                            : comparisons.length === 0
                                ? <p style={{ opacity: 0.5, fontSize: 14 }}>No other listings found</p>
                                : <div className="comparison-list">
                                    {comparisons.map((c, i) => {
                                        const savings = price - (c.price_inr || 0);
                                        return (
                                            <div key={i} className="comparison-row">
                                                <span className="comp-merchant">{c.merchant}</span>
                                                <span className="comp-price">
                                                    ₹{c.price_inr?.toLocaleString('en-IN') ?? 'N/A'}
                                                </span>
                                                {savings > 0 && (
                                                    <span className="comp-savings">Save ₹{Math.abs(savings).toLocaleString('en-IN')}</span>
                                                )}
                                                <a href={c.affiliate_url || c.product_url} target="_blank" rel="noreferrer" className="comp-link">
                                                    <IconExternalLink size={12} style={{ marginRight: 4 }} />
                                                    Visit
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
