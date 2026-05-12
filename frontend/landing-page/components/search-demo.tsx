"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, MapPin, ExternalLink, Lock, AlertCircle, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSearch } from "@/hooks/useSearch"
import { dashboardPath } from "@/lib/dashboard-url"

export default function SearchDemo() {
  const [query, setQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [showSignupWall, setShowSignupWall] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [searchCount, setSearchCount] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inlineSuggestions, setInlineSuggestions] = useState<string[]>([])
  const [frequentSearches, setFrequentSearches] = useState<string[]>([])
  const [suggestionState, setSuggestionState] = useState<{ original: string, suggested: string } | null>(null)

  const { search: clientSearch, indexLoaded } = useSearch()

  useEffect(() => {
    // Initialize search count from localStorage on mount
    const savedCount = localStorage.getItem('dropiq_landing_search_count')
    if (savedCount) {
      setSearchCount(parseInt(savedCount, 10))
    }

    setHasSearched(false)
    setShowSignupWall(false)

    // Fetch frequent searches for "Trending" (Same as Dashboard)
    fetch("/api/products/frequent-searches")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setFrequentSearches(data.searches.map((s: any) => typeof s === 'string' ? s : s.search_query))
        }
      })
      .catch(err => console.error("Failed to fetch frequent searches:", err))
  }, [])

  // Persist searchCount across page reloads
  useEffect(() => {
    if (searchCount > 0) {
      localStorage.setItem('dropiq_landing_search_count', String(searchCount))
    }
  }, [searchCount])

  // 250ms debounced client-side inline suggestions (Same as Dashboard)
  useEffect(() => {
    if (!query.trim()) {
      setInlineSuggestions([])
      // If index not loaded, we still show trending if focused
      setShowSuggestions(query === "" && frequentSearches.length > 0)
      return
    }
    if (!indexLoaded) return

    const t = setTimeout(() => {
      const fuzzyResults = clientSearch(query)
      // Extract keywords (brand + first few words)
      const toKeyword = (name: string) => name.replace(/\(.*?\)/g, "").trim().split(/\s+/).slice(0, 4).join(" ")
      const keywords = [...new Set(fuzzyResults.map((p: any) => toKeyword(p.product_name)))].slice(0, 6)
      setInlineSuggestions(keywords)
      setShowSuggestions(keywords.length > 0)
    }, 250)
    return () => clearTimeout(t)
  }, [query, indexLoaded, clientSearch, frequentSearches])

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault()
    const finalQuery = overrideQuery || query
    if (!finalQuery.trim()) return

    // If this is the second search, show the wall
    if (searchCount >= 1) {
      setShowSignupWall(true)
      return
    }

    setIsLoading(true)
    setShowSuggestions(false)
    setShowSignupWall(false)
    setSuggestionState(null)

    try {
      // Use the local rewrite /api (defined in next.config.mjs)
      const apiUrl = `/api/products/search?q=${encodeURIComponent(finalQuery)}&limit=15`
      console.log(`Searching via: ${apiUrl}`)
      
      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error(`Server responded with ${response.status}`)
      
      const data = await response.json()
      
      if (data.success) {
        if (data.products.length === 0 && indexLoaded) {
          // SAME LOGIC AS DASHBOARD: Fuzzy spelling fallback
          const fuzzyResults = clientSearch(finalQuery)
          if (fuzzyResults.length > 0) {
            const closest = fuzzyResults[0]
            const suggestedWord = closest.brand || closest.product_name.split(" ")[0]
            setSuggestionState({ original: finalQuery, suggested: suggestedWord })
            
            // Auto-fetch the suggested term (silently)
            const fallbackRes = await fetch(`/api/products/search?q=${encodeURIComponent(suggestedWord)}&limit=15`)
            const fallbackData = await fallbackRes.json()
            if (fallbackData.success) {
              setResults(fallbackData.products)
              setHasSearched(true)
              setSearchCount(prev => prev + 1)
            }
          } else {
            setResults([])
            setHasSearched(true)
            setSearchCount(prev => prev + 1)
          }
        } else {
          setResults(data.products)
          setHasSearched(true)
          setSearchCount(prev => prev + 1)
        }
      } else {
        console.error("Search failed:", data.error || data.message)
        alert(data.message || "Search failed. Please try another term.")
      }
    } catch (err: any) {
      console.error("Search failed:", err)
      alert(`Unable to reach search server. Please ensure the backend is running.`);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="container mx-auto px-4 py-20 bg-slate-50/50 dark:bg-slate-950/50 rounded-3xl border border-gray-100 dark:border-slate-800 my-16">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold dark:text-white mb-4">
          Try a Real-Time Search
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Experience how DropIQ finds the absolute cheapest option in your locality instantly.
        </p>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <form onSubmit={(e) => handleSearch(e)} className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (searchCount < 1 && inlineSuggestions.length > 0) setShowSuggestions(true) }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={searchCount >= 1 ? "Sign up or Login to continue searching..." : "Try searching 'iPhone 15 Pro' or 'Sony WH-1000XM5'..."}
            disabled={searchCount >= 1}
            className={`w-full pl-12 pr-32 py-4 rounded-2xl border-2 bg-white dark:bg-slate-900 shadow-lg outline-none transition-all ${
              searchCount >= 1 
                ? 'border-gray-200 dark:border-slate-800 text-gray-400 cursor-not-allowed bg-gray-50/50 dark:bg-slate-900/50' 
                : 'border-emerald-100 focus:border-emerald-500 dark:border-slate-800 dark:focus:border-cyan-500'
            }`}
          />
          {searchCount >= 1 ? (
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          ) : (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-emerald-500" />
          )}

          {searchCount >= 1 ? (
            <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
              <Link href={dashboardPath("/signup")}>
                <button
                  type="button"
                  className="h-full py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-sm"
                >
                  Sign Up
                </button>
              </Link>
            </div>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          )}
        </form>

        {/* Live Suggestions Dropdown (Same as Dashboard Results Page) */}
        {showSuggestions && (inlineSuggestions.length > 0 || (!query.trim() && frequentSearches.length > 0)) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-2xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {query.trim() ? (
              <>
                <div className="px-4 py-2 text-[10px] font-bold text-emerald-600 dark:text-cyan-400 uppercase tracking-widest border-b border-gray-50 dark:border-slate-800">
                  Quick Matches
                </div>
                {inlineSuggestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-5 py-3 text-sm cursor-pointer hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 flex items-center justify-between group transition-colors"
                    onMouseDown={() => {
                      setQuery(item)
                      setShowSuggestions(false)
                      handleSearch(undefined, item)
                    }}
                  >
                    <span>{item}</span>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="px-4 py-2 text-[10px] font-bold text-emerald-600 dark:text-cyan-400 uppercase tracking-widest border-b border-gray-50 dark:border-slate-800">
                  Trending Now
                </div>
                <div className="p-3 flex flex-wrap gap-2">
                  {frequentSearches.map((item, idx) => (
                    <button
                      key={idx}
                      className="px-4 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-cyan-300 rounded-full transition-colors border border-emerald-100/50 dark:border-slate-700"
                      onMouseDown={() => {
                        setQuery(item)
                        setShowSuggestions(false)
                        handleSearch(undefined, item)
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {hasSearched && (
        <div className="relative mt-12 min-h-[400px]">
          {/* Results Container with Blur when Wall is Active */}
          <div className={`transition-all duration-700 ${showSignupWall ? 'blur-md pointer-events-none select-none opacity-40' : 'animate-in fade-in slide-in-from-bottom-4'}`}>
            
            {/* Spelling Fallback Alert (Same as Dashboard) */}
            {suggestionState && (
              <div className="mb-8 flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-200 animate-in slide-in-from-left-4">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">
                  Nothing found for <span className="font-bold">&ldquo;{suggestionState.original}&rdquo;</span>. Showing results for <button onClick={() => { setQuery(suggestionState.suggested); handleSearch(undefined, suggestionState.suggested); }} className="font-bold underline decoration-2 underline-offset-2 hover:text-amber-600">&ldquo;{suggestionState.suggested}&rdquo;</button> instead.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-4">
                <h3 className="flex items-center gap-2 font-bold text-xl dark:text-white">
                  <span className="h-8 w-1 bg-emerald-500 rounded-full"></span>
                  Top Results
                </h3>
                <span className="text-sm font-medium text-emerald-600/80 dark:text-cyan-400/80 bg-emerald-50 dark:bg-cyan-900/20 px-3 py-1 rounded-full inline-block w-fit">
                  Offline stores coming soon...
                </span>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.length > 0 ? (
                  results.slice(0, 10).map((res, i) => {
                    const minPrice = Math.min(...results.map(r => r.price_inr || Infinity));
                    const isBest = res.price_inr === minPrice;
                    const productLink = dashboardPath(`/product/${res.id}?retailer=${encodeURIComponent(res.retailer_name)}`);
                    
                    return (
                      <Link key={i} href={productLink}>
                        <Card className={`p-4 flex flex-col h-full gap-3 border-2 transition-all group ${isBest ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/10 shadow-md' : 'border-gray-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-cyan-800'}`}>
                          {/* Product Image */}
                          <div className="w-full aspect-square bg-white dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-50 dark:border-slate-700 relative">
                            {isBest && (
                              <Badge className="absolute top-2 left-2 bg-emerald-500 text-white border-none text-[8px] h-4 px-1.5 z-10 shadow-sm">BEST VALUE</Badge>
                            )}
                            {res.image_url ? (
                              <img 
                                src={res.image_url} 
                                alt={res.product_name} 
                                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Product";
                                }}
                              />
                            ) : (
                              <div className="text-gray-300 dark:text-slate-600">
                                <Search className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex flex-col flex-grow">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">{res.retailer_name}</span>
                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight mb-2 flex-grow">{res.product_name}</span>
                            
                            <div className="font-extrabold text-lg text-emerald-700 dark:text-cyan-400 mb-3">
                              {res.price_inr ? `₹${res.price_inr.toLocaleString()}` : 'N/A'}
                            </div>

                            <div className="w-full mt-auto flex items-center justify-center rounded-md h-9 px-3 text-xs font-medium bg-transparent text-emerald-700 dark:text-cyan-400 border border-gray-200 dark:border-slate-700 group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:bg-cyan-600 transition-colors">
                              View Product
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-16 text-gray-500 border-2 border-dashed rounded-2xl dark:border-slate-800">
                    No results found for your search.
                  </div>
                )}
              </div>

              {results.length > 10 && !showSignupWall && (
                <button 
                  onClick={() => setShowSignupWall(true)}
                  className="w-full py-4 mt-2 text-emerald-600 font-bold hover:underline flex items-center justify-center gap-1 bg-emerald-50 dark:bg-slate-800/50 rounded-xl transition-colors hover:bg-emerald-100 dark:hover:bg-slate-800"
                >
                  View More Results <ExternalLink className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Signup Wall Card - Shown for View More or 2nd Search */}
          {showSignupWall && (
            <div className="absolute inset-0 flex items-start justify-center pt-20 z-20">
              <Card className="max-w-md w-full p-8 text-center shadow-2xl border-2 border-emerald-500 bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-300">
                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                  <Lock className="h-8 w-8 text-emerald-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Wanna compare more products?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Sign up to see the full list of products and unlock real-time price tracking across all retailers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={dashboardPath("/signup")} className="flex-1">
                    <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-lg">
                      Sign Up Free
                    </Button>
                  </Link>
                  <Link href={dashboardPath("/login")} className="flex-1">
                    <Button variant="outline" className="w-full h-12 border-2 border-emerald-100 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-800 text-gray-900 dark:text-white font-bold rounded-xl text-lg">
                      Login
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
