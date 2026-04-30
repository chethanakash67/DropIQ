'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import CountdownTimer from '@/components/CountdownTimer';
import DIQModal from '@/components/DIQModal';
import { useSearch } from '@/hooks/useSearch';

type DashboardProduct = {
    image_url?: string;
    [key: string]: unknown;
};

const CategoryItem = ({ cat, router }: { cat: any, router: any }) => {
    const [bloomProducts, setBloomProducts] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchBloom = async () => {
            try {
                const res = await fetch(`/api/products/search?q=${encodeURIComponent(cat.q)}&limit=3`);
                const data = await res.json();
                setBloomProducts(productsFrom(data));
            } catch (err) {
                console.error("Failed to fetch bloom:", err);
            }
        };
        fetchBloom();
    }, [cat.q]);

    return (
        <div className="category-item-wrapper">
            {bloomProducts.map((p, idx) => (
                <div key={p.id} className="bloom-mini-card" onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/product/${p.id}?retailer=${encodeURIComponent(p.retailer_name)}`);
                }}>
                    <img src={p.image_url} alt="" style={{ width: '100%', height: '50px', objectFit: 'contain' }} />
                    <div style={{ padding: '4px', textAlign: 'center', width: '100%' }}>
                        <p style={{ fontSize: '9px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.product_name}
                        </p>
                        <p style={{ fontSize: '10px', color: '#10b981', fontWeight: 800, marginTop: '2px' }}>₹{p.price_inr}</p>
                    </div>
                </div>
            ))}
            <div className="category-circle" onClick={() => router.push(`/results?q=${cat.q}`)} style={{ 
                width: '200px', height: '200px', borderRadius: '50%', background: 'var(--bg-secondary)', 
                border: '3px solid var(--border-focus)', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
                position: 'relative', boxShadow: '0 8px 25px rgba(16,185,129,0.15)', transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
            }}>
                {cat.image && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.15, background: `url(${cat.image}) center/cover no-repeat` }} />}
                <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {cat.image ? (
                         <img src={cat.image} alt={cat.name} style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '12px' }} />
                    ) : (
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', marginBottom: '12px' }} />
                    )}
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', zIndex: 2, marginBottom: '4px' }}>{cat.name}</h3>
                    <p style={{ color: 'var(--accent)', fontWeight: 700, zIndex: 2, fontSize: '14px', background: 'rgba(16, 185, 129, 0.08)', padding: '2px 8px', borderRadius: '12px' }}>From ₹{cat.price}</p>
                </div>
            </div>
        </div>
    );
};

const productsFrom = (data: { products?: unknown } | null | undefined): DashboardProduct[] =>
    Array.isArray(data?.products) ? data.products as DashboardProduct[] : [];

const searchesFrom = (data: { searches?: unknown } | null | undefined): string[] =>
    Array.isArray(data?.searches) ? data.searches.filter((search): search is string => typeof search === 'string') : [];

export default function DashboardPage() {
    const router = useRouter();
    const { currentUser, loading, authenticatedFetch } = useAuth();
    const { cart } = useCart();
    const { search: clientSearch, indexLoaded } = useSearch(); // client-side instant search
    
    const [searchTerm, setSearchTerm] = useState('');
    const [showDIQ, setShowDIQ] = useState(false);
    const [searchHistory, setSearchHistory] = useState<any[]>([]);
    const [frequentSearches, setFrequentSearches] = useState<any[]>(['Earphones', 'Earpods', 'Headphones', 'Neckbands', 'Smartwatch']);
    const [initialFrequent, setInitialFrequent] = useState<any[]>(['Earphones', 'Earpods', 'Headphones', 'Neckbands', 'Smartwatch']);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);
    const RECENT_SEARCHES_KEY = 'dropiq_recent_searches';

    useEffect(() => {
        if (cooldownTime <= 0) return;
        const timer = setInterval(() => setCooldownTime(prev => Math.max(0, prev - 1)), 1000);
        return () => clearInterval(timer);
    }, [cooldownTime]);

    const loadRecentSearches = () => {
        try {
            const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const pushRecentSearch = (query: string) => {
        const clean = query.trim();
        if (!clean) return;
        const existing = loadRecentSearches();
        const next = [clean, ...existing.filter((q: string) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 12);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
        setSearchHistory(next);
    };

    
    const [lootDeals, setLootDeals] = useState<any[]>([]);
    const [festiveCollection, setFestiveCollection] = useState<any[]>([]);
    const [grabOrGone, setGrabOrGone] = useState<any[]>([]);
    const [suggestedForYou, setSuggestedForYou] = useState<any[]>([]);
    const [bestGadgets, setBestGadgets] = useState<any[]>([]);
    const [favourites, setFavourites] = useState<any[]>([]);
    
    const [categoryMeta, setCategoryMeta] = useState<any[]>([
        { name: 'Earpods', price: '299', image: null, q: 'earpods' },
        { name: 'Earphones', price: '199', image: null, q: 'earphone' },
        { name: 'Headphones', price: '499', image: null, q: 'headphone' },
        { name: 'Neckbands', price: '399', image: null, q: 'neckband' }
    ]);

    const [slideshowImages, setSlideshowImages] = useState<any[]>([]);
    const [slideshowIndex, setSlideshowIndex] = useState(0);
    const [isPageReady, setIsPageReady] = useState(false);

    useEffect(() => {
        if (!loading && !currentUser) router.replace('/login');
        
        // Restore scroll position when user comes back
        const savedScroll = sessionStorage.getItem('dashboardScroll');
        if (isPageReady && savedScroll) {
            setTimeout(() => {
                window.scrollTo({ top: parseInt(savedScroll), behavior: 'instant' });
                sessionStorage.removeItem('dashboardScroll');
            }, 50); // Small buffer to ensure DOM is painted
        }
    }, [loading, currentUser, router, isPageReady]);

    // Save scroll position before navigating away
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                sessionStorage.setItem('dashboardScroll', window.scrollY.toString());
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch data on mount
    useEffect(() => {
        // Start the reveal timer IMMEDIATELY to sync with global loader (2s)
        // This runs only once on mount to ensure a stable reveal even if currentUser flickers
        const revealTimer = setTimeout(() => setIsPageReady(true), 1900);
        return () => clearTimeout(revealTimer);
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Hydrate local cache
                const localRecent = loadRecentSearches();
                if (localRecent.length > 0) setSearchHistory(localRecent);

                const fetchPromises = [
                    fetch('/api/products/search?limit=8&sortBy=price_desc').then(r => r.json()),
                    fetch('/api/products/search?limit=12&sortBy=rating').then(r => r.json()),
                    fetch('/api/products/search?limit=8&sortBy=price_asc').then(r => r.json()),
                    fetch('/api/products/search?limit=8&sortBy=rating').then(r => r.json()),
                    fetch('/api/products/search?limit=8').then(r => r.json()),
                    fetch('/api/products/search?limit=8').then(r => r.json()),
                    fetch('/api/products/frequent-searches').then(r => r.json())
                ];

                const [loot, festive, grab, suggested, gadgets, favs, frequent] = await Promise.all(fetchPromises);
                
                const lootProducts = productsFrom(loot);
                const festiveProducts = productsFrom(festive);
                const grabProducts = productsFrom(grab);
                const suggestedProducts = productsFrom(suggested);
                const gadgetProducts = productsFrom(gadgets);
                const favouriteProducts = productsFrom(favs);
                const frequentSearchItems = searchesFrom(frequent);

                if (loot.success) setLootDeals(lootProducts);
                if (festive.success) setFestiveCollection(festiveProducts);
                if (grab.success) setGrabOrGone(grabProducts);
                if (suggested.success) setSuggestedForYou(suggestedProducts);
                if (gadgets.success) setBestGadgets([...gadgetProducts].reverse());
                if (favs.success) setFavourites(favouriteProducts);
                if (frequent.success) {
                    setFrequentSearches(frequentSearchItems);
                    setInitialFrequent(frequentSearchItems);
                }
                
                if (currentUser) {
                    const historyRes = await authenticatedFetch('/api/products/search-history?limit=15');
                    if (historyRes.ok) {
                        const historyData = await historyRes.json();
                        const serverHistory = (historyData.history || [])
                            .map((item: any) => (typeof item === 'string' ? item : (item.search_query || item.query)))
                            .filter(Boolean);
                        if (serverHistory.length > 0) setSearchHistory(serverHistory);
                    }
                }
                
                const catImages = await Promise.all(categoryMeta.map(cat => 
                    fetch(`/api/products/search?limit=1&q=${cat.q}`).then(r => r.json())
                ));
                
                setCategoryMeta(prev => prev.map((cat, i) => ({
                    ...cat,
                    image: (catImages[i].success && productsFrom(catImages[i]).length > 0) ? productsFrom(catImages[i])[0].image_url : null
                })));

                const allProds = [...lootProducts, ...festiveProducts, ...suggestedProducts].filter(p => p.image_url);
                if (allProds.length > 0) {
                    const sorted = allProds.sort(() => 0.5 - Math.random());
                    setSlideshowImages(sorted.slice(0, 5));
                }

            } catch (e) {
                console.error("Dashboard data load failed", e);
            }
        };
        if (currentUser) fetchInitialData();
    }, [currentUser, authenticatedFetch]);

    // Handle dynamic search suggestions as user types
    // Priority: client-side instant search → server suggestions fallback
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFrequentSearches(initialFrequent);
            return;
        }

        const timer = setTimeout(async () => {
            // ── Client-side search (instant, no network) ─────────────────────
            if (indexLoaded) {
                const clientResults = clientSearch(searchTerm);
                if (clientResults.length > 0) {
                    // Extract short keyword suggestions: brand + first meaningful word(s) of model
                    const toKeyword = (name: string): string => {
                        // Strip color/variant info in parentheses, then take first 4 words max
                        const clean = name.replace(/\(.*?\)/g, '').trim();
                        const words = clean.split(/\s+/).filter(Boolean);
                        return words.slice(0, 4).join(' ');
                    };
                    const keywords = [...new Set(clientResults.map((p: any) => toKeyword(p.product_name)))].slice(0, 8);
                    setFrequentSearches(keywords);
                    setIsHistoryVisible(true);
                    return; // skip server call entirely
                }
            }

            // ── Server fallback (when client has 0 results or index not loaded yet) ─
            try {
                const res = await fetch(`/api/products/search-suggestions?q=${encodeURIComponent(searchTerm)}&limit=5`);
                const data = await res.json();
                if (data.success && data.suggestions.length > 0) {
                    setFrequentSearches(data.suggestions);
                    setIsHistoryVisible(true);
                } else {
                    setFrequentSearches([]);
                    if (searchTerm.trim().length >= 3) {
                        setIsHistoryVisible(false);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            }
        }, 250); // 250ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm, initialFrequent, indexLoaded, clientSearch]);

    const handleClearHistory = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Clear all search history?')) return;
        
        try {
            const res = await authenticatedFetch('/api/products/search-history', {
                method: 'DELETE'
            });
            if (res.ok) {
                setSearchHistory([]);
                localStorage.removeItem(RECENT_SEARCHES_KEY);
            }
        } catch (err) {
            console.error('Failed to clear history:', err);
            // Keep UX consistent even if API fails
            setSearchHistory([]);
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        }
    };

    useEffect(() => {
        if (slideshowImages.length === 0) return;
        const interval = setInterval(() => {
            setSlideshowIndex(prev => (prev + 1) % slideshowImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slideshowImages]);

    useEffect(() => {
        const highlightCenter = (container: Element) => {
            const cards = container.querySelectorAll('.product-card');
            if (cards.length === 0) return;
            const wrapper = container.parentElement;
            const containerRect = container.getBoundingClientRect();
            
            // Default center is 50%, but for specific sections we allow shifting left/right
            let centerRatio = 0.5;
            if (wrapper?.classList.contains('offset-left')) centerRatio = 0.4;
            if (wrapper?.classList.contains('offset-right')) centerRatio = 0.6;
            
            const targetPoint = containerRect.left + (containerRect.width * centerRatio);
            
            let closestIdx = 0;
            let closestDist = Infinity;
            cards.forEach((card, i) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const dist = Math.abs(cardCenter - targetPoint);
                if (dist < closestDist) { closestDist = dist; closestIdx = i; }
            });
            cards.forEach((card, i) => {
                if (i === closestIdx) card.classList.add('active-highlight');
                else card.classList.remove('active-highlight');
            });
        };

        const initTimer = setTimeout(() => {
            document.querySelectorAll('.horizontal-scroll-container').forEach(highlightCenter);
        }, 1200);

        // Standard auto-scroller for stepped rows
        const interval = setInterval(() => {
            document.querySelectorAll('.horizontal-scroll-container:not(.belt-scroll):not(.manual-scroll)').forEach(container => {
                if (container.children.length === 0) return;
                
                const firstChild = container.firstElementChild as HTMLElement;
                if (!firstChild) return;

                const gap = parseInt(window.getComputedStyle(container).gap) || 0;
                const shiftWidth = firstChild.offsetWidth + gap;
                
                firstChild.style.transition = 'margin-left 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                firstChild.style.marginLeft = `-${shiftWidth}px`;
                
                setTimeout(() => {
                    firstChild.style.transition = 'none';
                    firstChild.style.marginLeft = '0px';
                    container.appendChild(firstChild);
                    highlightCenter(container);
                }, 550); 
            });
        }, 3000);

        // Belt scroller for continuous smooth motion
        let rafId: number;
        const runBelt = () => {
            document.querySelectorAll('.belt-scroll').forEach(container => {
                const htmlContainer = container as HTMLElement;
                htmlContainer.scrollLeft += 0.4; // Very slow speed (approx 1 min for full width)
                
                const firstChild = htmlContainer.firstElementChild as HTMLElement;
                if (firstChild) {
                    const gap = parseInt(window.getComputedStyle(htmlContainer).gap) || 0;
                    const shiftPoint = firstChild.offsetWidth + gap;
                    
                    if (htmlContainer.scrollLeft >= shiftPoint) {
                        htmlContainer.scrollLeft -= shiftPoint;
                        htmlContainer.appendChild(firstChild);
                    }
                }
                highlightCenter(htmlContainer);
            });
            rafId = requestAnimationFrame(runBelt);
        };
        rafId = requestAnimationFrame(runBelt);

        return () => {
            clearInterval(interval);
            clearTimeout(initTimer);
            cancelAnimationFrame(rafId);
        };
    }, [lootDeals, festiveCollection, grabOrGone, suggestedForYou, bestGadgets, favourites]); // Rebind after fetch and ready

    const handleSearch = () => {
        const q = searchTerm.trim();
        if (!q) return;
        pushRecentSearch(q);
        sessionStorage.setItem('last_search_timestamp', Date.now().toString());
        router.push(`/results?q=${encodeURIComponent(q)}`);
    };

    useEffect(() => {
        const lastSearch = sessionStorage.getItem('last_search_timestamp');
        if (lastSearch) {
            const elapsed = Math.floor((Date.now() - parseInt(lastSearch)) / 1000);
            if (elapsed < 60) {
                setCooldownTime(60 - elapsed);
            }
        }
    }, []);

    const loadProduct = (id: string, retailer: string) => {
        sessionStorage.setItem('dashboardScroll', window.scrollY.toString());
        router.push(`/product/${id}?retailer=${encodeURIComponent(retailer)}`);
    };

    if (loading || !currentUser) return null;


    const planType = currentUser.planType === 'premium' ? 'max' : currentUser.planType || 'free';
    const maxCredits = planType === 'max' ? 75 : planType === 'pro' ? 50 : 20;
    const currentCredits = currentUser.credits ?? 0;
    const usedCredits = Math.max(0, maxCredits - currentCredits);

    const renderCard = (p: any, i: number, uniqueKey: string) => {
        const isFestive = uniqueKey === 'festive';
        const isLoot = uniqueKey === 'loot';
        const isGrab = uniqueKey === 'grab';
        const isFav = uniqueKey === 'fav';
        const isSuggested = uniqueKey === 'suggested';
        const isCart = uniqueKey === 'cart';

        const displayTitle = (isFestive || isLoot || isGrab || isFav || isSuggested)
            ? (p.product_name?.length > 25 ? p.product_name.substring(0, 25) + '...' : p.product_name)
            : p.product_name;

        // Custom Layout for "Loot Deals" & "Suggested For You" (Slim Horizontal Rectangle)
        if (isLoot || isSuggested) {
            const cardWidth = isSuggested ? '100%' : '260px';
            const cardClass = isSuggested ? "product-card" : "product-card floating-card";
            return (
                <div key={`${uniqueKey}-${i}`} className={cardClass} onClick={() => loadProduct(p.id, p.retailer_name)} style={{ cursor: 'pointer', minWidth: cardWidth, maxWidth: cardWidth, padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', height: '100%' }}>
                        {p.image_url ? (
                            <img src={p.image_url} alt={displayTitle} style={{ width: '80px', height: '80px', objectFit: 'contain', flexShrink: 0 }} />
                        ) : (
                            <div style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', flexShrink: 0 }}>No Image</div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <div className="product-brand" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.brand || 'DROP IQ'}</div>
                            <div className="product-title" style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {displayTitle}
                            </div>
                            <div className="product-price" style={{ fontSize: '18px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>₹{p.price_inr}</div>
                        </div>
                    </div>
                </div>
            );
        }

        const cardClass = isFestive ? "product-card revolving-border-card" :
                        (isFav ? "product-card periodic-shine-card" : "product-card");
        const widthStyle = (isFestive || isFav || isCart) ? { width: '100%' } : { minWidth: '200px', maxWidth: '200px' };

        return (
            <div key={`${uniqueKey}-${i}`} className={cardClass} onClick={() => loadProduct(p.id, p.retailer_name)} style={{ cursor: 'pointer', ...widthStyle, border: isFav ? '4px double #10b981' : undefined, background: isFav ? 'transparent' : undefined, boxShadow: isFav ? 'none' : undefined }}>
                <div style={(isFestive || isFav) ? { padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', zIndex: 2 } : { display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {p.image_url ? (
                        <img src={p.image_url} alt={displayTitle} style={{ width: '100%', height: isFestive ? '110px' : '100px', objectFit: 'contain', marginBottom: '12px' }} />
                    ) : (
                        <div style={{ width: '100%', height: isFestive ? '110px' : '100px', background: 'rgba(16,185,129,0.06)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>No Image</div>
                    )}
                    <div className="product-brand" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.brand || 'DROP IQ'}</div>
                    <div className="product-title" style={{ fontSize: isFestive ? '13px' : '14px', fontWeight: 600, marginTop: '4px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: isFestive ? 1 : 2, WebkitBoxOrient: 'vertical' }}>
                        {displayTitle}
                    </div>
                    <div className="product-price" style={{ fontSize: isFestive ? '18px' : '20px', fontWeight: 800, color: '#059669', marginTop: 'auto' }}>₹{p.price_inr}</div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="dashboard" style={{ visibility: isPageReady ? 'visible' : 'hidden', opacity: isPageReady ? 1 : 0 }}>
                <Navbar />
                <div className="credit-meter-mini">
                    <span
                        className="credit-upgrade-link"
                        onClick={() => router.push('/plans')}
                        style={{ 
                            cursor: 'pointer', 
                            textDecoration: 'underline', 
                            color: 'var(--accent)', 
                            fontWeight: 700, 
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        Upgrade
                    </span>
                    <div className="credit-meter-track" aria-label="Credit usage">
                        <div
                            className="credit-meter-bar"
                            style={{ width: `${Math.min(100, Math.max(0, (usedCredits / maxCredits) * 100))}%` }}
                        />
                    </div>
                    <div className="credit-meter-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span className="credit-meter-text" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {currentCredits} / {maxCredits} credits
                        </span>
                        <CountdownTimer 
                            lastRefreshed={currentUser?.creditsLastRefreshed} 
                            style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}
                        />
                    </div>
                </div>

                <div className="search-container" style={{ marginTop: '20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '30px', paddingLeft: '20px' }}>
                    <div className="search-box" style={{ flex: '0 1 85%', minWidth: 'unset' }}>
                        <input
                            type="text"
                            id="searchInput"
                            spellCheck="true"
                            placeholder={currentCredits < 3 ? "Insufficient credits to search..." : "Search for products, brands and more..."}
                            autoComplete="off"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                            onFocus={() => setIsHistoryVisible(true)}
                            onBlur={() => setTimeout(() => setIsHistoryVisible(false), 200)}
                            style={{ 
                                flex: 1,
                                opacity: currentCredits < 3 ? 0.6 : 1,
                                cursor: currentCredits < 3 ? 'not-allowed' : 'text'
                            }}
                            disabled={currentCredits < 3}
                        />
                        <button 
                            id="searchButton" 
                            onClick={handleSearch}
                            disabled={currentCredits < 3}
                            style={{
                                opacity: currentCredits < 3 ? 0.5 : 1,
                                cursor: currentCredits < 3 ? 'not-allowed' : 'pointer',
                                background: currentCredits < 3 ? '#94a3b8' : 'var(--accent)'
                            }}
                        >
                            Search
                        </button>

                        {currentCredits < 3 && (
                            <div style={{ 
                                position: 'absolute', 
                                bottom: '-24px', 
                                left: '20px', 
                                color: '#ef4444', 
                                fontSize: '12px', 
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
                                <span style={{ marginRight: '8px' }}>You have no sufficient credit points.</span>
                                <CountdownTimer 
                                    lastRefreshed={currentUser?.creditsLastRefreshed} 
                                    prefix="Refills in: "
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}
                                />
                            </div>
                        )}

                        {isHistoryVisible && (searchHistory.length > 0 || frequentSearches.length > 0) && (
                            <div className="search-history-dropdown">
                                {/* PHASE 1: Empty input -> Show history */}
                                {!searchTerm.trim() && searchHistory.length > 0 && (
                                    <div className="search-history-section" style={{ borderBottom: frequentSearches.length > 0 ? '1px solid rgba(16, 185, 129, 0.1)' : 'none' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 8px' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Recent History</div>
                                            <button 
                                                onClick={handleClearHistory}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        {searchHistory.map((item, idx) => {
                                            const queryText = typeof item === 'string' ? item : (item.search_query || item.query);
                                            if (!queryText) return null;
                                            return (
                                                <div key={`hist-${idx}`} className="search-history-item" 
                                                    style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}
                                                    onClick={() => {
                                                        setSearchTerm(queryText);
                                                        router.push(`/results?q=${encodeURIComponent(queryText)}`);
                                                    }}>
                                                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{queryText}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {/* PHASE 2: Handle Trending/Suggestions */}
                                {frequentSearches.length > 0 && (
                                    <div className="search-suggestions-section">
                                        {/* Show header ONLY if search term is empty */}
                                        {!searchTerm.trim() && (
                                            <div style={{ padding: '15px 20px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trending Now</div>
                                        )}
                                        
                                        <div style={{ padding: searchTerm.trim() ? '8px 0' : '0 15px 12px', display: 'flex', flexDirection: searchTerm.trim() ? 'column' : 'row', flexWrap: 'wrap', gap: '8px' }}>
                                            {frequentSearches.map((keyword, idx) => {
                                                const displayValue = (keyword.search_query || keyword).replace(/_/g, ' ');
                                                const actualValue = keyword.search_query || keyword;
                                                
                                                if (searchTerm.trim()) {
                                                    // List style for dynamic suggestions
                                                    return (
                                                        <div key={`suggest-${idx}`} className="search-history-item" onClick={() => {
                                                            setSearchTerm(actualValue);
                                                            router.push(`/results?q=${encodeURIComponent(actualValue)}`);
                                                        }}>
                                                            <span style={{ fontSize: '14px', fontWeight: 500 }}>{displayValue}</span>
                                                        </div>
                                                    );
                                                } else {
                                                    // Pill style for trending (empty input)
                                                    return (
                                                        <div key={`freq-${idx}`} className="frequent-search-item" onClick={() => {
                                                            setSearchTerm(actualValue);
                                                            router.push(`/results?q=${encodeURIComponent(actualValue)}`);
                                                        }} style={{ fontSize: '12px', padding: '6px 14px' }}>
                                                            {displayValue}
                                                        </div>
                                                    );
                                                }
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button className="diq-button shiny-shield-btn shake-periodically" 
                            onClick={() => setShowDIQ(true)} 
                            style={{ width: 'auto', padding: '14px 28px', whiteSpace: 'nowrap', borderRadius: '30px' }}>
                        Find Perfect Match
                    </button>
                </div>
                
                {/* PRICE DROP ALERT (PRO ONLY) */}
                {(currentUser.planType === 'pro' || currentUser.planType === 'max' || currentUser.planType === 'premium') && (
                    <div 
                        className="price-drop-banner" 
                        onClick={() => router.push('/price-drops')}
                        style={{
                            margin: '0 auto 24px',
                            background: 'rgba(16, 185, 129, 0.05)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            borderRadius: '20px',
                            padding: '16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            maxWidth: '1200px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '24px' }}>📉</div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Real-time Price Drop Alerts</h4>
                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>6 new price drops detected in your categories.</p>
                            </div>
                        </div>
                        <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '14px' }}>View All →</div>
                    </div>
                )}
                
                {/* PROMO SETTINGS */}
                <div className="promo-banner">
                    {slideshowImages.length > 0 ? (
                        <div className="slideshow-container">
                            {slideshowImages.map((img, i) => (
                                <div key={i} className={`slideshow-slide ${i === slideshowIndex ? 'active' : ''}`}>
                                    <img src={img.image_url} alt="" className="slideshow-img" />
                                    <div className="slideshow-overlay" />
                                    <div className="slideshow-content">
                                        <div className="slideshow-tag">BIG SALE LIVE</div>
                                        <h2 className="slideshow-title">UP TO 70% OFF</h2>
                                        <p className="slideshow-subtitle">Exclusive deals on {img.product_name || img.name}</p>
                                        <button className="shiny-shield-btn" style={{ padding: '12px 24px', width: 'fit-content', marginTop: '20px', borderRadius: '30px' }}
                                                onClick={() => router.push(`/product/${img.id}?retailer=${encodeURIComponent(img.retailer_name || '')}`)}>
                                            Shop Now →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                            BIG SAVINGS LIVE TODAY
                        </div>
                    )}
                </div>

                <div className="brands-spotlight" style={{ padding: '24px', margin: '0 0 64px 0', background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-1px', zIndex: 10 }}>ACCORDING TO RECENT FESTIVAL OFFERS</h2>
                </div>

                {festiveCollection.length > 0 && (
                    <div className="dashboard-section" style={{ marginBottom: '64px' }}>
                        <h2 className="dashboard-section-header">Festive Collection</h2>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(4, 1fr)', 
                            gap: '32px', 
                            justifyContent: 'space-around',
                            alignItems: 'center'
                        }}>
                            {festiveCollection.slice(0, 8).map((p, i) => renderCard(p, i, 'festive'))}
                        </div>
                    </div>
                )}

                {lootDeals.length > 0 && (
                    <div className="dashboard-section" style={{ marginBottom: '64px' }}>
                        <h2 className="dashboard-section-header">Look for Loot Deals</h2>
                        <div className="scroll-focus-wrapper hide-indicator clean-highlight">
                            <div className="horizontal-scroll-container belt-scroll">
                                {lootDeals.map((p, i) => renderCard(p, i, 'loot'))}
                            </div>
                        </div>
                    </div>
                )}

                {grabOrGone.length > 0 && (
                    <div className="dashboard-section hand-drawn-section" style={{ marginBottom: '64px' }}>
                        <h2 className="dashboard-section-header">Grab or Gone</h2>
                        <div className="scroll-focus-wrapper no-pop manual-scroll hide-indicator hand-drawn-shelf">
                            <div className="horizontal-scroll-container manual-scroll">
                                {grabOrGone.map((p, i) => renderCard(p, i, 'grab'))}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="brands-spotlight" style={{ marginBottom: '64px', marginTop: '32px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px', zIndex: 10 }}>BRANDS IN SPOTLIGHT</h2>
                    <p style={{ zIndex: 10, color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>Up to 50% Off Top Tier Selections</p>
                </div>

                {suggestedForYou.length > 0 && (
                    <div className="dashboard-section" style={{ marginBottom: '64px' }}>
                        <h2 className="dashboard-section-header">Suggested For You</h2>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: '24px' 
                        }}>
                            {suggestedForYou.slice(0, 8).map((p, i) => renderCard(p, i, 'suggested'))}
                        </div>
                    </div>
                )}
                
                {bestGadgets.length > 0 && (
                    <div className="dashboard-section" style={{ marginBottom: '64px' }}>
                        <h2 className="dashboard-section-header">Best Gadgets & Appliances</h2>
                        <div className="scroll-focus-wrapper">
                            <div className="horizontal-scroll-container">
                                {bestGadgets.map((p, i) => renderCard(p, i, 'gadgets'))}
                            </div>
                        </div>
                    </div>
                )}

                {cart.length > 0 && (
                    <div className="dashboard-section" style={{ marginBottom: '64px' }}>
                        <h2 className="dashboard-section-header" style={{ borderColor: '#f59e0b', color: '#b45309' }}>Your Cart - Ready to Buy Now</h2>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                            gap: '32px',
                            justifyContent: 'flex-start',
                            alignItems: 'stretch'
                        }}>
                            {cart.map((p, i) => renderCard(p, i, 'cart'))}
                        </div>
                    </div>
                )}

                {favourites.length > 0 && (
                    <div className="dashboard-section" style={{ marginBottom: '64px' }}>
                        <h2 className="dashboard-section-header" style={{ borderColor: '#ec4899', color: '#be185d' }}>User's Favourites</h2>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(4, 1fr)', 
                            gap: '32px'
                        }}>
                            {favourites.slice(0, 4).map((p, i) => renderCard(p, i, 'fav'))}
                        </div>
                    </div>
                )}

                <div className="dashboard-section" style={{ marginBottom: '64px' }}>
                    <h2 className="dashboard-section-header" style={{ borderLeft: 'none', textAlign: 'center', color: '#064e3b' }}>Explore Categories</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginTop: '48px', justifyItems: 'center' }}>
                        {categoryMeta.map((cat, i) => (
                            <CategoryItem key={i} cat={cat} router={router} />
                        ))}
                    </div>
                </div>
                
                <div style={{ textAlign: 'center', margin: '64px 0' }}></div>
            </div>
            {showDIQ && <DIQModal onClose={() => setShowDIQ(false)} />}
        </>
    );
}
