'use client';

const CACHE_VERSION = 1;
const CACHE_PREFIX = 'dropiq_product_detail_cache';
const CACHE_INDEX_KEY = `${CACHE_PREFIX}:index:v${CACHE_VERSION}`;
export const PRODUCT_DETAIL_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 40;
const memoryCache = new Map<string, ProductDetailCacheEntry<unknown, unknown>>();

type CacheIndexEntry = {
    key: string;
    lastAccessedAt: number;
};

export type ProductDetailCacheEntry<TProduct, TComparison> = {
    version: number;
    userId: string;
    productId: string;
    retailerHint: string;
    product: TProduct;
    comparisons: TComparison[];
    recommendations: TProduct[];
    cachedAt: number;
    expiresAt: number;
};

function normalizeCachePart(value: string | number | null | undefined): string {
    return String(value || 'none').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

export function getProductDetailCacheKey(userId: string | number, productId: string | number, retailerHint?: string | null): string {
    return [
        CACHE_PREFIX,
        `v${CACHE_VERSION}`,
        normalizeCachePart(userId),
        normalizeCachePart(productId),
        normalizeCachePart(retailerHint),
    ].join(':');
}

function readIndex(): CacheIndexEntry[] {
    try {
        const parsed = JSON.parse(localStorage.getItem(CACHE_INDEX_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeIndex(entries: CacheIndexEntry[]) {
    localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(entries));
}

function touchIndex(key: string) {
    const now = Date.now();
    const existingIndex = readIndex();
    const next = [
        { key, lastAccessedAt: now },
        ...existingIndex.filter(entry => entry.key !== key),
    ].slice(0, MAX_CACHE_ENTRIES);

    for (const stale of existingIndex.slice(MAX_CACHE_ENTRIES)) {
        memoryCache.delete(stale.key);
        localStorage.removeItem(stale.key);
    }

    writeIndex(next);
}

export function readProductDetailCache<TProduct, TComparison>(
    key: string
): ProductDetailCacheEntry<TProduct, TComparison> | null {
    const memoryEntry = memoryCache.get(key) as ProductDetailCacheEntry<TProduct, TComparison> | undefined;
    if (memoryEntry) {
        if (memoryEntry.expiresAt > Date.now()) {
            touchIndex(key);
            return memoryEntry;
        }

        memoryCache.delete(key);
        localStorage.removeItem(key);
    }

    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as ProductDetailCacheEntry<TProduct, TComparison>;
        if (parsed.version !== CACHE_VERSION || parsed.expiresAt <= Date.now()) {
            localStorage.removeItem(key);
            writeIndex(readIndex().filter(entry => entry.key !== key));
            return null;
        }

        touchIndex(key);
        memoryCache.set(key, parsed as ProductDetailCacheEntry<unknown, unknown>);
        return parsed;
    } catch {
        memoryCache.delete(key);
        localStorage.removeItem(key);
        return null;
    }
}

export function writeProductDetailCache<TProduct, TComparison>(
    key: string,
    entry: Omit<ProductDetailCacheEntry<TProduct, TComparison>, 'version' | 'cachedAt' | 'expiresAt'>
) {
    const now = Date.now();
    const payload: ProductDetailCacheEntry<TProduct, TComparison> = {
        ...entry,
        version: CACHE_VERSION,
        cachedAt: now,
        expiresAt: now + PRODUCT_DETAIL_CACHE_TTL_MS,
    };

    memoryCache.set(key, payload as ProductDetailCacheEntry<unknown, unknown>);

    try {
        localStorage.setItem(key, JSON.stringify(payload));
        touchIndex(key);
    } catch {
        const entries = readIndex().sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
        const oldest = entries[0];
        if (oldest) {
            memoryCache.delete(oldest.key);
            localStorage.removeItem(oldest.key);
            writeIndex(entries.slice(1));
        }

        try {
            localStorage.setItem(key, JSON.stringify(payload));
            touchIndex(key);
        } catch {
            // Storage can still fail in private mode or when the product payload is too large.
        }
    }
}
