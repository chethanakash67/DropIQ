'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';


// ─── Types ────────────────────────────────────────────────────────────────────
interface SearchProduct {
  id: string;
  product_name: string;
  brand?: string;
  category?: string;
  price_inr?: number;
  image_url?: string;
  retailer_name?: string;
  normalized_key?: string;
}

interface UseSearchReturn {
  suggestions: SearchProduct[];
  isSearching: boolean;
  indexLoaded: boolean;
  search: (query: string) => SearchProduct[];
  debouncedSearch: (query: string) => void;
}


// ─── Abbreviation Map ─────────────────────────────────────────────────────────
// Add new entries here as products grow. This is the ONLY place to maintain it.
const ABBREVIATION_MAP: Record<string, string> = {
  // Sony WF / WH Series
  'wf1000xm5': 'sony wf 1000xm5',
  'wf1000xm4': 'sony wf 1000xm4',
  'wh1000xm5': 'sony wh 1000xm5',
  'wh1000xm4': 'sony wh 1000xm4',
  'wf': 'sony wf',
  'xm5': 'wf 1000xm5',
  'xm4': 'wf 1000xm4',
  // boAt
  'boat': 'boat',
  'airdopes': 'boat airdopes',
  'ba131': 'boat airdopes 131',
  'ba141': 'boat airdopes 141',
  // Noise
  'noise': 'noise',
  // Apple
  'airpods': 'apple airpods',
  'ap': 'apple airpods',
  // JBL
  'jbl': 'jbl',
  // Samsung Buds
  'gwb': 'galaxy buds',
  'buds2': 'samsung galaxy buds 2',
  'buds3': 'samsung galaxy buds 3',
  // ANC
  'anc': 'noise cancelling',
  'nc': 'noise cancelling',
};

// ─── Levenshtein Distance (Secondary Ranking Signal) ─────────────────────────
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: b.length + 1 }, () => new Array(a.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      if (b.charAt(j - 1) === a.charAt(i - 1)) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// ─── Normalize Query ──────────────────────────────────────────────────────────
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')   // remove special chars & dashes
    .replace(/\s+/g, ' ')          // collapse multiple spaces
    .trim();
}

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');    // strip everything, no spaces
}

// ─── Expand Abbreviations ─────────────────────────────────────────────────────
function expandAbbreviation(query: string): string {
  const key = normalizeKey(query);
  return ABBREVIATION_MAP[key] || query;
}

// ─── Singleton cache — avoids re-fetching on navigation ──────────────────────
let _indexCache: SearchProduct[] | null = null;
let _fuseCache: Fuse<SearchProduct> | null = null;
const INDEX_TTL_MS = 5 * 60 * 1000; // re-fetch after 5 minutes
let _indexFetchedAt = 0;

const FUSE_OPTIONS: IFuseOptions<SearchProduct> = {

  keys: [
    { name: 'product_name', weight: 0.6 },
    { name: 'brand', weight: 0.25 },
    { name: 'category', weight: 0.15 },
  ],
  threshold: 0.38,      // 0 = exact, 1 = match anything. 0.38 = typo-tolerant but not garbage
  distance: 200,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

// ─── Main Hook ────────────────────────────────────────────────────────────────
export function useSearch(): UseSearchReturn {
  const [indexLoaded, setIndexLoaded] = useState(!!_indexCache);
  const [suggestions, setSuggestions] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load index once on mount (or if stale)
  useEffect(() => {
    const now = Date.now();
    if (_indexCache && (now - _indexFetchedAt) < INDEX_TTL_MS) {
      setIndexLoaded(true);
      return;
    }

    abortRef.current = new AbortController();

    fetch('/api/products/search-index', { signal: abortRef.current.signal })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          _indexCache = data.products as SearchProduct[];
          _fuseCache = new Fuse(_indexCache, FUSE_OPTIONS);
          _indexFetchedAt = Date.now();
          setIndexLoaded(true);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.warn('[useSearch] Failed to load search index:', err);
        }
      });

    return () => abortRef.current?.abort();
  }, []);

  /**
   * Main search function — runs entirely in memory.
   * Priority: exact normalized → token prefix → Fuse fuzzy
   */
  const search = useCallback((query: string): SearchProduct[] => {
    if (!_indexCache || query.trim().length < 2) return [];

    const raw = normalize(query);
    const expanded = normalize(expandAbbreviation(raw));
    const queryKey = normalizeKey(expanded);

    // ── Pass 1: Exact normalized_key match ───────────────────────────────────
    const exactMatches = _indexCache.filter(p =>
      (p.normalized_key || '').includes(queryKey)
    );
    if (exactMatches.length >= 3) return exactMatches.slice(0, 30);

    // ── Pass 2: Token prefix match ───────────────────────────────────────────
    // Split the query and the product name into tokens; every query token must
    // be a prefix of at least one product token (AND logic across tokens)
    const queryTokens = expanded.split(' ').filter(Boolean);
    const prefixMatches = _indexCache.filter(p => {
      const productTokens = normalize(p.product_name || '').split(' ');
      return queryTokens.every(qt =>
        productTokens.some(pt => pt.startsWith(qt))
      );
    });

    const combined = [...new Set([...exactMatches, ...prefixMatches])];
    if (combined.length >= 3) return combined.slice(0, 30);

    // ── Pass 3: Fuse.js fuzzy fallback ───────────────────────────────────────
    let all = [...combined];
    if (_fuseCache && all.length < 15) {
      const fuzzy = _fuseCache.search(expanded, { limit: 15 });
      const fuzzyProducts = fuzzy.map(r => r.item);
      all = [...new Set([...all, ...fuzzyProducts])];
    }

    // ── Pass 4: Secondary Ranking (Levenshtein Edit Distance) ────────────────
    // We sort the final array to boost products whose names have a smaller edit distance to the query.
    // To avoid penalizing long product names, we compare against a substring of the product name.
    const queryLen = expanded.length;
    all.sort((a, b) => {
      const nameA = normalize(a.product_name || '');
      const nameB = normalize(b.product_name || '');
      
      const distA = levenshtein(expanded, nameA.substring(0, queryLen));
      const distB = levenshtein(expanded, nameB.substring(0, queryLen));
      
      return distA - distB;
    });

    return all.slice(0, 30);
  }, []);

  /**
   * Debounced variant — call with query, get live suggestions.
   * 250ms debounce as specified.
   */
  const debounceSearch = useCallback((query: string) => {
    setIsSearching(true);
    const results = search(query);
    setSuggestions(results);
    setIsSearching(false);
  }, [search]);

  return { suggestions, isSearching, indexLoaded, search, debouncedSearch: debounceSearch };
}
