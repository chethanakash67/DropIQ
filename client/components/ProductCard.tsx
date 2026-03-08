'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconStore, IconDollar, IconExternalLink } from '@/components/Icons';

interface Comparison {
    merchant: string;
    price_inr?: number;
    affiliate_url?: string;
    product_url?: string;
}

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

export default function ProductCard({ product }: { product: Product }) {
    const router = useRouter();
    const isOfflineStore = product.store_id !== undefined;
    const hasImage = product.image_url && product.image_url.trim() !== '';
    const price = parseFloat(String(product.price_inr));
    const rating = parseFloat(String(product.rating));

    const [showCompare, setShowCompare] = useState(false);
    const [comparisons, setComparisons] = useState<Comparison[]>([]);
    const [compareLoading, setCompareLoading] = useState(false);
    const [compareLoaded, setCompareLoaded] = useState(false);

    const handleClick = () => {
        if (isOfflineStore || showCompare) return;
        router.push(`/product/${product.id}`);
    };

    const handleCompare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (showCompare) {
            setShowCompare(false);
            return;
        }
        setShowCompare(true);
        if (compareLoaded) return;
        setCompareLoading(true);
        try {
            const retailer = (product.retailer_name as string || '').toLowerCase();
            const res = await fetch(`/api/products/${retailer}/${product.id}/price-comparisons`);
            const data = await res.json();
            if (data.success) setComparisons(data.comparisons || []);
        } catch {
            // silently fail
        } finally {
            setCompareLoading(false);
            setCompareLoaded(true);
        }
    };

    return (
        <div
            className={`product-card${isOfflineStore ? ' offline-store-product' : ''}`}
            onClick={handleClick}
            style={{ cursor: isOfflineStore ? 'default' : 'pointer' }}
        >
            {/* Store badge */}
            <div className={`store-tag${isOfflineStore ? ' offline-tag' : ''}`}>
                {isOfflineStore && <IconStore size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                {product.retailer_name}
            </div>

            {/* Product image */}
            {hasImage
                ? <img src={product.image_url} alt={product.product_name} className="product-image"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                : <div className="no-image-placeholder">No Image</div>
            }

            {/* Name */}
            <div className="product-name">{product.product_name || product.name}</div>

            {/* Price */}
            <div className="product-price">
                {!isNaN(price) && price > 0
                    ? `\u20B9${price.toLocaleString('en-IN')}`
                    : 'Visit website for price'}
            </div>

            {/* Rating */}
            {product.rating && !isNaN(rating) && (
                <div className="product-rating">
                    <span className="rating-stars">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
                    <span className="rating-value">{rating.toFixed(1)}</span>
                    <span className="rating-max">/ 5.0</span>
                </div>
            )}

            {/* Click hint */}
            {!isOfflineStore && !showCompare && (
                <div className="card-view-details">View details →</div>
            )}

            {/* Compare stores button */}
            {!isOfflineStore && (
                <button
                    className={`card-compare-btn${showCompare ? ' active' : ''}`}
                    onClick={handleCompare}
                    title="Compare prices across stores"
                >
                    <IconDollar size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {showCompare ? 'Hide Comparison' : 'Compare Stores'}
                </button>
            )}

            {/* Inline compare panel */}
            {showCompare && (
                <div className="card-compare-panel" onClick={e => e.stopPropagation()}>
                    {/* Current store row */}
                    <div className="compare-row current-store-row">
                        <span className="comp-merchant">
                            {product.retailer_name}
                            <span className="comp-current-badge">current</span>
                        </span>
                        <span className="comp-price">
                            {!isNaN(price) && price > 0 ? `\u20B9${price.toLocaleString('en-IN')}` : '—'}
                        </span>
                        {(product.affiliate_url || product.product_url) && (
                            <a
                                href={(product.affiliate_url || product.product_url) as string}
                                target="_blank"
                                rel="noreferrer"
                                className="comp-link"
                                onClick={e => e.stopPropagation()}
                            >
                                <IconExternalLink size={11} style={{ marginRight: 3 }} />
                                Visit
                            </a>
                        )}
                    </div>

                    {compareLoading && (
                        <div className="compare-loading">Searching other stores…</div>
                    )}

                    {!compareLoading && comparisons.length === 0 && compareLoaded && (
                        <div className="compare-empty">No other listings found</div>
                    )}

                    {!compareLoading && comparisons.map((c, i) => {
                        const cPrice = c.price_inr ?? 0;
                        const diff = !isNaN(price) && price > 0 && cPrice > 0 ? cPrice - price : null;
                        return (
                            <div key={i} className="compare-row">
                                <span className="comp-merchant">{c.merchant}</span>
                                <span className="comp-price">
                                    {cPrice > 0 ? `\u20B9${cPrice.toLocaleString('en-IN')}` : '—'}
                                </span>
                                {diff !== null && diff < 0 && (
                                    <span className="comp-cheaper">Save \u20B9{Math.abs(diff).toLocaleString('en-IN')}</span>
                                )}
                                {diff !== null && diff > 0 && (
                                    <span className="comp-pricier">+\u20B9{diff.toLocaleString('en-IN')}</span>
                                )}
                                <a
                                    href={(c.affiliate_url || c.product_url) as string}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="comp-link"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <IconExternalLink size={11} style={{ marginRight: 3 }} />
                                    Visit
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Offline store info inline */}
            {isOfflineStore && product.store_owner && (
                <div className="store-owner-tag" style={{ marginTop: 8 }}>
                    {product.store_owner}{product.store_phone ? ` · ${product.store_phone}` : ''}
                </div>
            )}
        </div>
    );
}
