'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InsufficientCreditsModal from '@/components/InsufficientCreditsModal';

interface Product {
    id: string | number;
    product_name?: string;
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

interface Retailer {
    id: string;
    name: string;
    location?: string;
}

function ResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentUser, loading, authenticatedFetch, setCurrentUser } = useAuth();
    const { totalItems, setShowCart } = useCart();

    const initialQ = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(initialQ);
    const [currentQ, setCurrentQ] = useState(initialQ);
    const [products, setProducts] = useState<Product[]>([]);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [sortBy, setSortBy] = useState('rating');
    const [sortAutoSet, setSortAutoSet] = useState(true);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [retailer, setRetailer] = useState('');
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [creditsModalOpen, setCreditsModalOpen] = useState(false);
    const [creditErrorMeta, setCreditErrorMeta] = useState<{ required?: number; available?: number }>({});
    const [cooldownTime, setCooldownTime] = useState(0);

    useEffect(() => {
        if (cooldownTime <= 0) return;
        const timer = setInterval(() => setCooldownTime(prev => Math.max(0, prev - 1)), 1000);
        return () => clearInterval(timer);
    }, [cooldownTime]);

    useEffect(() => {
        if (!loading && !currentUser) router.replace('/login');
    }, [loading, currentUser, router]);

    useEffect(() => {
        fetch('/api/products/retailers')
            .then(r => r.json())
            .then(d => { if (d.success) setRetailers(d.retailers); })
            .catch(() => { });
    }, []);

    const performSearch = useCallback(async (q: string, sort: string, min: string, max: string, ret: string, isManual = false) => {
        if (!currentUser) return;
        setResultsLoading(true);
        try {
            const params = new URLSearchParams({ q, sortBy: sort });
            
            // Smart deduplication: 
            // 1. If it's a manual search button click, we intent to charge (backend handles 30s cooldown)
            // 2. If it's an automatic load (e.g., Back button), we check if we already paid for this query in this session
            const chargedQueries = JSON.parse(sessionStorage.getItem('charged_queries') || '[]');
            const queryKey = q.toLowerCase().trim();
            const wasChargedInSession = chargedQueries.includes(queryKey);
            
            const shouldCharge = isManual ? 'true' : (wasChargedInSession ? 'false' : 'true');
            params.append('chargeCredits', shouldCharge);

            if (min) params.append('minPrice', min);
            if (max) params.append('maxPrice', max);
            if (ret) params.append('retailer', ret);
            
            const res = await authenticatedFetch(`/api/products/search?${params}`);
            const data = await res.json();
            
            if (res.status === 402 || data?.error === 'INSUFFICIENT_CREDITS') {
                setCreditErrorMeta({ required: data.requiredCredits, available: data.availableCredits });
                setCreditsModalOpen(true);
                setResultsLoading(false);
                return;
            }
            
            if (data.success) {
                setProducts(data.products);
                if (typeof data.credits === 'number') {
                    setCurrentUser({ ...currentUser, credits: data.credits });
                }
                
                // Start 60s cooldown visual for this query
                setCooldownTime(60);

                // Save to session so "Back" button navigation is free for this query
                if (!wasChargedInSession) {
                    const nextCharged = Array.from(new Set([...chargedQueries, queryKey]));
                    sessionStorage.setItem('charged_queries', JSON.stringify(nextCharged));
                }
            }
        } catch (_) { }
        setResultsLoading(false);
    }, [currentUser, setCurrentUser, authenticatedFetch]);

    useEffect(() => {
        if (currentQ) {
            const s = currentQ.toLowerCase().trim();
            let defaultSort = 'rating';
            if (s.includes('earphone') || s.includes('ear phone')) defaultSort = 'price_asc';
            const newSort = sortAutoSet ? defaultSort : sortBy;
            if (sortAutoSet) setSortBy(defaultSort);
            
            // Automatic load (likely mount or URL change), NOT a manual button click
            performSearch(currentQ, newSort, minPrice, maxPrice, retailer, false);
        }

        // Restore scroll position when user comes back
        const savedScroll = sessionStorage.getItem('resultsScroll');
        if (savedScroll) {
            setTimeout(() => {
                window.scrollTo({ top: parseInt(savedScroll), behavior: 'instant' });
                sessionStorage.removeItem('resultsScroll');
            }, 100);
        }
    }, [currentQ]);

    // Save scroll position before navigating away
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                sessionStorage.setItem('resultsScroll', window.scrollY.toString());
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = () => {
        const q = searchTerm.trim();
        if (!q) { alert('Please enter a search term'); return; }
        
        // Manual search click - force charge intent (backend 30s window will still protect from double-clicks)
        if (q === currentQ) {
            performSearch(q, sortBy, minPrice, maxPrice, retailer, true);
        } else {
            setCurrentQ(q);
        }
        router.push(`/results?q=${encodeURIComponent(q)}`, { scroll: true });
    };

    const handleFilterChange = (newSort?: string, newMin?: string, newMax?: string, newRet?: string) => {
        const s = newSort !== undefined ? newSort : sortBy;
        const mn = newMin !== undefined ? newMin : minPrice;
        const mx = newMax !== undefined ? newMax : maxPrice;
        const r = newRet !== undefined ? newRet : retailer;
        if (newSort !== undefined) setSortAutoSet(false);
        if (currentQ) performSearch(currentQ, s, mn, mx, r);
    };

    if (loading || !currentUser) return null;

    return (
        <div className="results-page">
            <Navbar />
            
            <style jsx>{`
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .moving-gradient {
                    background: linear-gradient(-45deg, #10b981, #34d399, #059669, #10b981);
                    background-size: 400% 400%;
                    animation: gradient-shift 15s ease infinite;
                }
            `}</style>

            <div className="container" style={{ paddingTop: '20px' }}>
                <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px', transition: 'color 0.3s' }}>
                    ← Back to Dashboard
                </Link>
            </div>

            <div className="container">
                <div className="results-search-container" style={{ marginBottom: '24px', position: 'relative' }}>
                <input
                    type="text"
                    placeholder={currentUser.credits < 3 ? "Insufficient credits to search..." : "Search for audio products..."}
                    autoComplete="off"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                    disabled={currentUser.credits < 3}
                    style={{
                        opacity: currentUser.credits < 3 ? 0.6 : 1,
                        cursor: currentUser.credits < 3 ? 'not-allowed' : 'text'
                    }}
                />
                <button 
                    onClick={handleSearch}
                    disabled={currentUser.credits < 3}
                    style={{
                        opacity: currentUser.credits < 3 ? 0.5 : 1,
                        cursor: currentUser.credits < 3 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Search
                </button>
                {cooldownTime > 0 && currentUser.credits >= 3 && (
                    <div style={{
                        position: 'absolute',
                        right: '110px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#10b981',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        pointerEvents: 'none',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                        FREE REFRESH: {cooldownTime}s
                    </div>
                )}
                {currentUser.credits < 3 && (
                    <div style={{ 
                        position: 'absolute', 
                        bottom: '-20px', 
                        left: '10px', 
                        color: '#ef4444', 
                        fontSize: '11px', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
                        You have no sufficient credit points.
                    </div>
                )}
            </div>

            <div className="filters moving-gradient" style={{ 
                borderRadius: '24px', 
                padding: '24px', 
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)',
                color: 'white',
                marginBottom: '40px'
            }}>
                <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>Filters</h3>
                <div className="filter-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <div className="filter-group">
                        <label>Sort By</label>
                        <select value={sortBy} onChange={e => { setSortBy(e.target.value); handleFilterChange(e.target.value); }}>
                            <option value="price_asc">Price (Low to High)</option>
                            <option value="rating">Rating (High to Low)</option>
                            <option value="price_desc">Price (High to Low)</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Min Price (₹)</label>
                        <input type="number" placeholder="0" value={minPrice}
                            onChange={e => { setMinPrice(e.target.value); handleFilterChange(undefined, e.target.value); }} />
                    </div>
                    <div className="filter-group">
                        <label>Max Price (₹)</label>
                        <input type="number" placeholder="100000" value={maxPrice}
                            onChange={e => { setMaxPrice(e.target.value); handleFilterChange(undefined, undefined, e.target.value); }} />
                    </div>
                    <div className="filter-group">
                        <label>Store</label>
                        <select value={retailer} onChange={e => { setRetailer(e.target.value); handleFilterChange(undefined, undefined, undefined, e.target.value); }}>
                            <option value="">All Stores</option>
                            {retailers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div id="resultsContainer">
                {resultsLoading
                    ? <div className="loading">Loading products...</div>
                    : products.length === 0
                        ? <div className="no-results">No products found. Try adjusting your filters.</div>
                        : <div className="products-grid">
                            {products.map((p, i) => <ProductCard key={`${p.id}-${i}`} product={p} />)}
                        </div>
                }
            </div>
            <InsufficientCreditsModal
                open={creditsModalOpen}
                onClose={() => setCreditsModalOpen(false)}
                required={creditErrorMeta.required}
                available={creditErrorMeta.available}
            />
        </div>
        <Footer />
    </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="loading">Loading...</div>}>
            <ResultsContent />
        </Suspense>
    );
}

