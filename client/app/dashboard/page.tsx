'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import DIQModal from '@/components/DIQModal';
import { IconClock, IconTrending, IconTarget } from '@/components/Icons';

export default function DashboardPage() {
    const router = useRouter();
    const { currentUser, loading } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [frequentSearches, setFrequentSearches] = useState<string[]>([]);
    const [searchHistory, setSearchHistory] = useState<{ search_query: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showDIQ, setShowDIQ] = useState(false);

    useEffect(() => {
        if (!loading && !currentUser) router.replace('/login');
    }, [loading, currentUser, router]);

    useEffect(() => {
        fetch('/api/products/frequent-searches')
            .then(r => r.json())
            .then(d => { if (d.success) setFrequentSearches(d.searches); })
            .catch(() => { });
    }, []);

    const loadHistory = async () => {
        try {
            const res = await fetch('/api/products/search-history?limit=6');
            const data = await res.json();
            if (data.success && data.history?.length > 0) setSearchHistory(data.history.slice(0, 6));
        } catch (_) { }
    };

    const handleSearch = () => {
        const q = searchTerm.trim();
        if (!q) return;
        router.push(`/results?q=${encodeURIComponent(q)}`);
    };

    const selectSearch = (term: string) => {
        setShowSuggestions(false);
        router.push(`/results?q=${encodeURIComponent(term)}`);
    };

    if (loading || !currentUser) return null;

    const suggestions = searchHistory.length > 0 ? searchHistory.map(h => h.search_query) : frequentSearches;
    const suggestionsLabel = searchHistory.length > 0 ? 'Recent Searches' : 'Trending';
    const SuggestionsIcon = searchHistory.length > 0 ? IconClock : IconTrending;

    return (
        <>
            <div className="dashboard">
                <Navbar />

                <div className="dashboard-hero">
                    <h1>Find Your Perfect Product</h1>
                    <p>Search millions of products or let our AI match you with exactly what you need</p>

                    <div className="search-container">
                        <div className="search-box">
                            <input
                                type="text"
                                id="searchInput"
                                placeholder="Search for headphones, keyboards, monitors…"
                                autoComplete="off"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                                onFocus={async () => { await loadHistory(); setShowSuggestions(true); }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            />
                            <button id="searchButton" onClick={handleSearch}>Search</button>
                        </div>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="frequent-searches">
                                <h3><SuggestionsIcon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />{suggestionsLabel}</h3>
                                <div className="frequent-searches-list">
                                    {suggestions.map((s, i) => (
                                        <div key={i} className="frequent-search-item" onClick={() => selectSearch(s)}>{s}</div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="diq-divider">or</div>

                        <button className="diq-button" onClick={() => setShowDIQ(true)}>
                            <IconTarget size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Find Perfect Match with D_IQ Intelligence
                        </button>
                    </div>
                </div>
            </div>

            {showDIQ && <DIQModal onClose={() => setShowDIQ(false)} />}
        </>
    );
}
