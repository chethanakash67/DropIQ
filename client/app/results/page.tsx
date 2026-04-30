'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import InsufficientCreditsModal from '@/components/InsufficientCreditsModal';
import { useSearch } from '@/hooks/useSearch';

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
    const { search: clientSearch, indexLoaded } = useSearch();

    const initialQ = searchParams.get('q') || '';
    const initialSort = searchParams.get('sortBy') || 'rating';
    const initialMin = searchParams.get('minPrice') || '';
    const initialMax = searchParams.get('maxPrice') || '';
    const initialRet = searchParams.get('retailer') || '';

    const [searchTerm, setSearchTerm] = useState(initialQ);
    const [currentQ, setCurrentQ] = useState(initialQ);
    const [inlineSuggestions, setInlineSuggestions] = useState<string[]>([]);
    const [showInlineDrop, setShowInlineDrop] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [suggestionState, setSuggestionState] = useState<{ original: string, suggested: string } | null>(null);
    const [storeRedirectState, setStoreRedirectState] = useState<{ query: string, originalStoreName: string, availableStoreId: string, availableStoreName: string } | null>(null);
    const [trendingFallback, setTrendingFallback] = useState<any[]>([]);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [sortBy, setSortBy] = useState(initialSort);
    const [sortAutoSet, setSortAutoSet] = useState(true);
    const [minPrice, setMinPrice] = useState(initialMin);
    const [maxPrice, setMaxPrice] = useState(initialMax);
    const [retailer, setRetailer] = useState(initialRet);
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [creditsModalOpen, setCreditsModalOpen] = useState(false);
    const [creditErrorMeta, setCreditErrorMeta] = useState<{ required?: number; available?: number }>({});
    const [cooldownTime, setCooldownTime] = useState(0);

    // On mount: resume any in-progress cooldown from sessionStorage (survives navigation)
    useEffect(() => {
        const exp = sessionStorage.getItem('search_cooldown_exp');
        if (exp) {
            const remaining = Math.max(0, Math.round((parseInt(exp) - Date.now()) / 1000));
            if (remaining > 0) setCooldownTime(remaining);
        }
    }, []);

    // 250ms debounced client-side inline suggestions
    useEffect(() => {
        if (!searchTerm.trim() || !indexLoaded) {
            setInlineSuggestions([]);
            setShowInlineDrop(false);
            return;
        }
        const t = setTimeout(() => {
            const results = clientSearch(searchTerm);
            const toKeyword = (name: string) => name.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(0, 4).join(' ');
            const keywords = [...new Set(results.map((p: any) => toKeyword(p.product_name as string)))].slice(0, 6);
            setInlineSuggestions(keywords);
            setShowInlineDrop(keywords.length > 0);
        }, 250);
        return () => clearTimeout(t);
    }, [searchTerm, indexLoaded, clientSearch]);

    // Load trending fallback (10 products) for zero-result state
    useEffect(() => {
        fetch('/api/products/search?limit=10&sortBy=rating')
            .then(r => r.json())
            .then(d => { if (d.success) setTrendingFallback(d.products || []); })
            .catch(() => {});
    }, []);


    useEffect(() => {
        if (cooldownTime <= 0) return;
        const timer = setInterval(() => {
            setCooldownTime(prev => {
                const next = Math.max(0, prev - 1);
                // Keep sessionStorage in sync so it survives navigation
                if (next > 0) {
                    sessionStorage.setItem('search_cooldown_exp', String(Date.now() + next * 1000));
                } else {
                    sessionStorage.removeItem('search_cooldown_exp');
                }
                return next;
            });
        }, 1000);
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
                // Clear active suggestion states
                setSuggestionState(null);
                setStoreRedirectState(null);

                if (data.products.length === 0) {
                    // Check if it's because of a specific store filter
                    if (ret) {
                        const allStoreParams = new URLSearchParams(params);
                        allStoreParams.delete('retailer');
                        allStoreParams.set('chargeCredits', 'false');
                        const allStoreRes = await authenticatedFetch(`/api/products/search?${allStoreParams}`);
                        const allStoreData = await allStoreRes.json();
                        
                        if (allStoreData.success && allStoreData.products.length > 0) {
                            // Another store has it!
                            const availableStoreName = allStoreData.products[0].retailer_name;
                            const availableStoreObj = retailers.find(r => r.name === availableStoreName || r.id === availableStoreName);
                            const availableStoreId = availableStoreObj ? availableStoreObj.id : availableStoreName;
                            
                            const originalStoreObj = retailers.find(r => r.id === ret);
                            const originalStoreName = originalStoreObj ? originalStoreObj.name : ret;

                            setStoreRedirectState({
                                query: q,
                                originalStoreName,
                                availableStoreId,
                                availableStoreName
                            });
                            
                            // Only show the products for that available store
                            const filteredProducts = allStoreData.products.filter((p: any) => p.retailer_name === availableStoreName);
                            setProducts(filteredProducts);
                            setResultsLoading(false);
                            return;
                        }
                    }

                    // If we reach here, no store has it. Try fuzzy spelling fallback.
                    if (indexLoaded) {
                        const fuzzyResults = clientSearch(q);
                        if (fuzzyResults.length > 0) {
                            const closest = fuzzyResults[0];
                            const closestWord = closest.brand || closest.product_name.split(' ')[0];
                            
                            setSuggestionState({ original: q, suggested: closestWord });
                            
                            const newParams = new URLSearchParams(params);
                            newParams.set('q', closestWord);
                            newParams.set('chargeCredits', 'false');
                            const newRes = await authenticatedFetch(`/api/products/search?${newParams}`);
                            const newData = await newRes.json();
                            if (newData.success) {
                                setProducts(newData.products);
                            } else {
                                setProducts([]);
                            }
                        } else {
                            setProducts([]);
                        }
                    } else {
                        setProducts([]);
                    }
                } else {
                    setProducts(data.products);
                }

                if (typeof data.credits === 'number') {
                    setCurrentUser({ ...currentUser, credits: data.credits });
                }
                
                // Start 60s cooldown, persist expiry so navigation doesn't reset it
                const expiry = Date.now() + 60 * 1000;
                sessionStorage.setItem('search_cooldown_exp', String(expiry));
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
        
        // Manual search click - force charge intent
        if (q === currentQ) {
            performSearch(q, sortBy, minPrice, maxPrice, retailer, true);
        } else {
            setCurrentQ(q);
        }
        
        const p = new URLSearchParams(window.location.search);
        p.set('q', q);
        router.push(`/results?${p.toString()}`, { scroll: true });
    };

    const handleFilterChange = (newSort?: string, newMin?: string, newMax?: string, newRet?: string) => {
        const s = newSort !== undefined ? newSort : sortBy;
        const mn = newMin !== undefined ? newMin : minPrice;
        const mx = newMax !== undefined ? newMax : maxPrice;
        const r = newRet !== undefined ? newRet : retailer;
        if (newSort !== undefined) setSortAutoSet(false);
        
        const p = new URLSearchParams();
        if (currentQ) p.set('q', currentQ);
        if (s) p.set('sortBy', s);
        if (mn) p.set('minPrice', mn);
        if (mx) p.set('maxPrice', mx);
        if (r) p.set('retailer', r);
        router.replace(`/results?${p.toString()}`, { scroll: false });
        
        if (currentQ) performSearch(currentQ, s, mn, mx, r);
    };

    if (loading || !currentUser) return null;

    const userCredits = currentUser.credits ?? 0;

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
                    spellCheck="true"
                    placeholder={userCredits < 3 ? "Insufficient credits to search..." : "Search for audio products..."}
                    autoComplete="off"
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); }}
                    onKeyDown={e => { if (e.key === 'Enter') { setShowInlineDrop(false); handleSearch(); } }}
                    onFocus={() => { if (inlineSuggestions.length > 0) setShowInlineDrop(true); }}
                    onBlur={() => setTimeout(() => setShowInlineDrop(false), 180)}
                    disabled={userCredits < 3}
                    style={{
                        opacity: userCredits < 3 ? 0.6 : 1,
                        cursor: userCredits < 3 ? 'not-allowed' : 'text'
                    }}
                />
                {/* Inline client-side suggestion dropdown */}
                {showInlineDrop && inlineSuggestions.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-card)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: '16px',
                        marginTop: '6px',
                        zIndex: 999,
                        overflow: 'hidden',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            Quick Matches
                        </div>
                        {inlineSuggestions.map((name, idx) => (
                            <div
                                key={idx}
                                style={{ padding: '11px 18px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)', transition: 'background 0.15s' }}
                                onMouseDown={() => {
                                    setSearchTerm(name);
                                    setShowInlineDrop(false);
                                    setCurrentQ(name);
                                    router.push(`/results?q=${encodeURIComponent(name)}`);
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.07)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                {name}
                            </div>
                        ))}
                    </div>
                )}
                <button 
                    onClick={handleSearch}
                    disabled={userCredits < 3}
                    style={{
                        opacity: userCredits < 3 ? 0.5 : 1,
                        cursor: userCredits < 3 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Search
                </button>

                {userCredits < 3 && (
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

            {/* FREE REFRESH timer — shown below search bar, never overlapping the input */}
            {cooldownTime > 0 && userCredits >= 3 && (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#10b981',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.08)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    marginTop: '10px',
                    animation: 'fadeIn 0.3s ease',
                    letterSpacing: '0.03em'
                }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    FREE REFRESH: {cooldownTime}s
                </div>
            )}

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
                            <option value="relevance">Relevance</option>
                            <option value="rating">Ratings (High to Low)</option>
                            <option value="price_asc">Price (Low to High)</option>
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

            <div id="resultsContainer" style={{ minHeight: '600px', position: 'relative' }}>
                {resultsLoading && products.length === 0
                    ? (
                        <div className="products-grid">
                            {Array(8).fill(0).map((_, i) => (
                                <div key={i} style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    padding: '12px',
                                    height: '320px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    animation: 'pulse 1.5s infinite ease-in-out'
                                }}>
                                    <div style={{ width: '100%', height: '120px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }} />
                                    <div style={{ width: '80%', height: '14px', background: 'var(--bg-secondary)', borderRadius: '4px' }} />
                                    <div style={{ width: '60%', height: '14px', background: 'var(--bg-secondary)', borderRadius: '4px' }} />
                                    <div style={{ marginTop: 'auto', width: '40%', height: '20px', background: 'var(--bg-secondary)', borderRadius: '4px' }} />
                                </div>
                            ))}
                        </div>
                    )
                    : products.length === 0 && !suggestionState && !storeRedirectState
                        ? (
                            <div style={{ padding: '40px 0' }}>
                                <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '32px' }}>
                                    No results found for <strong style={{ color: 'var(--text-primary)' }}>&ldquo;{currentQ}&rdquo;</strong>.{' '}
                                    Try{' '}
                                    <a
                                        onClick={() => { setSearchTerm('earbuds'); router.push('/results?q=earbuds'); }}
                                        style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                                    >
                                        earbuds
                                    </a>{' '}
                                    instead.
                                </p>
                                {trendingFallback.length > 0 && (
                                    <>
                                        <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                            Trending right now
                                        </p>
                                        <div className="products-grid">
                                            {trendingFallback.map((p, i) => <ProductCard key={`trend-${i}`} product={p} />)}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                        : (
                            <>
                                {storeRedirectState && (
                                    <div style={{ padding: '10px 0 30px 0' }}>
                                        <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
                                            This store doesn't have <strong style={{ color: 'var(--text-primary)' }}>&ldquo;{storeRedirectState.query}&rdquo;</strong>. Try searching in{' '}
                                            <a
                                                onClick={() => {
                                                    setRetailer(storeRedirectState.availableStoreId);
                                                    setStoreRedirectState(null);
                                                    handleFilterChange(undefined, undefined, undefined, storeRedirectState.availableStoreId);
                                                }}
                                                style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                                            >
                                                {storeRedirectState.availableStoreName}
                                            </a>{' '}
                                            instead.
                                        </p>
                                    </div>
                                )}
                                {suggestionState && (
                                    <div style={{ padding: '10px 0 30px 0' }}>
                                        <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
                                            Nothing found using exact keyword <strong style={{ color: 'var(--text-primary)' }}>&ldquo;{suggestionState.original}&rdquo;</strong>. Try using{' '}
                                            <a
                                                onClick={() => {
                                                    setSearchTerm(suggestionState.suggested);
                                                    setCurrentQ(suggestionState.suggested);
                                                    setSuggestionState(null);
                                                    const p = new URLSearchParams(window.location.search);
                                                    p.set('q', suggestionState.suggested);
                                                    router.push(`/results?${p.toString()}`);
                                                }}
                                                style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                                            >
                                                {suggestionState.suggested}
                                            </a>{' '}
                                            instead.
                                        </p>
                                    </div>
                                )}
                                <div className="products-grid" style={{
                                    opacity: resultsLoading ? 0.4 : 1,
                                    pointerEvents: resultsLoading ? 'none' : 'auto',
                                    transition: 'opacity 0.2s ease',
                                }}>
                                    {products.map((p, i) => <ProductCard key={`${p.id}-${i}`} product={p} />)}
                                </div>
                            </>
                        )
                }
            </div>
            <InsufficientCreditsModal
                open={creditsModalOpen}
                onClose={() => setCreditsModalOpen(false)}
                required={creditErrorMeta.required}
                available={creditErrorMeta.available}
            />
        </div>
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

