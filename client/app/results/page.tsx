'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

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
    const { currentUser, loading } = useAuth();
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
    const [retailers, setRetailers] = useState<{ online: Retailer[]; offline: Retailer[] }>({ online: [], offline: [] });

    useEffect(() => {
        if (!loading && !currentUser) router.replace('/login');
    }, [loading, currentUser, router]);

    useEffect(() => {
        fetch('/api/products/retailers')
            .then(r => r.json())
            .then(d => { if (d.success) setRetailers(d.retailers); })
            .catch(() => { });
    }, []);

    const performSearch = useCallback(async (q: string, sort: string, min: string, max: string, ret: string) => {
        setResultsLoading(true);
        try {
            const params = new URLSearchParams({ q, sortBy: sort });
            if (min) params.append('minPrice', min);
            if (max) params.append('maxPrice', max);
            if (ret) params.append('retailer', ret);
            const res = await fetch(`/api/products/search?${params}`);
            const data = await res.json();
            if (data.success) setProducts(data.products);
        } catch (_) { }
        setResultsLoading(false);
    }, []);

    useEffect(() => {
        if (currentQ) {
            const s = currentQ.toLowerCase().trim();
            let defaultSort = 'rating';
            if (s.includes('earphone') || s.includes('ear phone')) defaultSort = 'price_asc';
            const newSort = sortAutoSet ? defaultSort : sortBy;
            if (sortAutoSet) setSortBy(defaultSort);
            performSearch(currentQ, newSort, minPrice, maxPrice, retailer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQ]);

    const handleSearch = () => {
        const q = searchTerm.trim();
        if (!q) { alert('Please enter a search term'); return; }
        setCurrentQ(q);
        router.push(`/results?q=${encodeURIComponent(q)}`, { scroll: false });
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
            <div className="results-header-bar">
                <button className="back-button" onClick={() => router.push('/dashboard')}>← Back to Dashboard</button>
                <button className="cart-button" onClick={() => setShowCart(true)}>
                    🛒 Cart {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                </button>
            </div>

            <div className="results-search-container">
                <input
                    type="text"
                    placeholder="Search for audio products..."
                    autoComplete="off"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            <div className="filters">
                <h3>Filters</h3>
                <div className="filter-row">
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
                            <optgroup label="Online Stores">
                                {retailers.online.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </optgroup>
                            {retailers.offline.length > 0 && (
                                <optgroup label="🏪 Offline Stores">
                                    {retailers.offline.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}{r.location ? ` - ${r.location}` : ''}</option>
                                    ))}
                                </optgroup>
                            )}
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
