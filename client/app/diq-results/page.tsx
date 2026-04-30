'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import { IconCart, IconTrophy, IconStore, IconClipboard, IconInfo, IconMapPin, IconPhone, IconArrowLeft } from '@/components/Icons';

interface ProductResult {
    id: string | number;
    product_name?: string;
    name?: string;
    price_inr?: number | string;
    price?: number | string;
    image_url?: string;
    image?: string;
    diq_score?: number | string;
    diq_rating?: string;
    retailer?: string;
    affiliate_url?: string;
    product_url?: string;
    link?: string;
    has_anc?: boolean;
    battery_hours?: number;
    has_fast_charge?: boolean;
    mic_quality_score?: string | number;
    source_type?: string;
    is_offline_product?: boolean;
    disclaimer?: string;
    store_name?: string;
    owner_phone?: string;
    isLocked?: boolean;
    [key: string]: unknown;
}

interface DIQAnswer {
    id: string;
    text?: string;
    description?: string;
    importance?: number;
}

interface DIQQuestion {
    id: string;
    question: string;
    hasImportance?: boolean;
}

export default function DIQResultsPage() {
    const router = useRouter();
    const { currentUser, loading } = useAuth();
    const { addToCart, totalItems, setShowCart } = useCart();
    const [products, setProducts] = useState<ProductResult[]>([]);
    const [answers, setAnswers] = useState<Record<string, DIQAnswer>>({});
    const [questions, setQuestions] = useState<DIQQuestion[]>([]);

    useEffect(() => {
        if (!loading && !currentUser) { router.replace('/login'); return; }
        const p = sessionStorage.getItem('diq_results');
        const a = sessionStorage.getItem('diq_answers');
        const q = sessionStorage.getItem('diq_questions');
        if (!p) { router.replace('/dashboard'); return; }
        try {
            setProducts(JSON.parse(p));
            if (a) setAnswers(JSON.parse(a));
            if (q) setQuestions(JSON.parse(q));
        } catch (_) { }
    }, [loading, currentUser, router]);

    if (loading || !currentUser || products.length === 0) return null;

    return (
        <div className="diq-results-page">
            <Navbar />
            <div className="diq-results-header-bar">
                <button className="back-button" onClick={() => { sessionStorage.removeItem('diq_results'); router.push('/dashboard'); }}>
                    <IconArrowLeft size={15} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Back to Dashboard
                </button>
            </div>

            <div className="diq-results-header">
                <h2 className="diq-results-title">Your Personalized Recommendations</h2>
                <p className="diq-results-subtitle">Products ranked by D_IQ Score based on your preferences</p>
            </div>

            {/* User Preferences Summary */}
            {questions.length > 0 && Object.keys(answers).length > 0 && (
                <div className="user-preferences-summary">
                    <h3 className="preferences-title"><IconClipboard size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Your Preferences</h3>
                    <div className="preferences-list">
                        {questions.map(q => {
                            const ans = answers[q.id];
                            if (!ans) return null;
                            return (
                                <div key={q.id} className="preference-item">
                                    <div className="preference-question">{q.question}</div>
                                    <div className="preference-answer">{ans.text || ans.id}</div>
                                    {ans.description && <div className="preference-description">{ans.description}</div>}
                                    {q.hasImportance && ans.importance !== undefined && (
                                        <span className="preference-importance">Priority: {ans.importance}%</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="diq-results-grid">
                {products.map((product, index) => {
                    const rank = index + 1;
                    const rankClass = rank <= 3 ? ` rank-${rank}` : '';

                    const scoreClass = product.diq_rating === 'Excellent' ? 'excellent'
                        : product.diq_rating === 'Good' ? 'good'
                            : product.diq_rating === 'Fair' ? 'fair' : 'poor';

                    const features: string[] = [];
                    if (product.has_anc) features.push('ANC');
                    if (product.battery_hours && product.battery_hours > 0) features.push(`${product.battery_hours}h Battery`);
                    if (product.has_fast_charge) features.push('Fast Charge');
                    if (parseFloat(String(product.mic_quality_score)) >= 4) features.push('Good Mic');

                    const isOffline = product.source_type === 'offline' || product.is_offline_product;

                    return (
                        <div key={`${product.id}-${index}`} className={`product-card${isOffline ? ' offline-product' : ''}${product.isLocked ? ' locked' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className={`diq-rank-badge${rankClass}`}>
                                {rank <= 3 ? <><IconTrophy size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> #{rank}</> : `#${rank}`}
                            </span>
                            {isOffline && <span className="offline-badge"><IconStore size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Offline Store</span>}
                            {product.isLocked && (
                                <div className="locked-product-overlay">
                                    <p>Upgrade to unlock this premium recommendation</p>
                                </div>
                            )}

                            {(product.image_url || product.image) && (!isOffline || (product.image_url && product.image_url.trim()))
                                ? <img src={product.image_url || product.image} alt={product.product_name || product.name} className={`diq-product-image${product.isLocked ? ' blurred' : ''}`} />
                                : <div className="no-image-placeholder">No Image</div>
                            }

                            <h3 className={`product-name${product.isLocked ? ' blurred' : ''}`}>{product.product_name || product.name}</h3>
                            <p className={`product-price${product.isLocked ? ' blurred' : ''}`}>₹{product.price_inr || product.price}</p>

                            <div className={`diq-score-container${product.isLocked ? ' blurred' : ''}`}>
                                <div className="diq-score-label">D_IQ Score</div>
                                <div className={`diq-score-value ${scoreClass}`}>{product.diq_score}</div>
                                <div className="diq-rating">{product.diq_rating}</div>
                            </div>

                            {features.length > 0 && (
                                <div className={`diq-features-list${product.isLocked ? ' blurred' : ''}`}>
                                    {features.map((f, i) => <span key={i} className="diq-feature-badge">{f}</span>)}
                                </div>
                            )}

                            {isOffline && product.disclaimer && (
                                <div className="diq-offline-disclaimer">
                                    <span className="disclaimer-icon"><IconInfo size={14} /></span>
                                    <span className="disclaimer-text">{product.disclaimer}</span>
                                </div>
                            )}

                            {isOffline && product.store_name && (
                                <div className="diq-store-info">
                                    <strong><IconMapPin size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Available at: {product.store_name}</strong>
                                    {product.owner_phone && <span><br /><IconPhone size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Contact: {product.owner_phone}</span>}
                                </div>
                            )}

                            <div className="diq-product-actions">
                                <button className="add-to-cart-btn" disabled={product.isLocked} onClick={() => addToCart(product as Record<string, unknown>)}>
                                    <IconCart size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Add to Cart
                                </button>
                                <button className="diq-buy-button"
                                    disabled={product.isLocked}
                                    onClick={() => window.open(String(product.affiliate_url || product.product_url || product.link || '#'), '_blank')}>
                                    {isOffline ? 'Visit Store' : `View on ${product.retailer}`}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
