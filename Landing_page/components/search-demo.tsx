"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, ExternalLink, Lock, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3002"

export default function SearchDemo() {
  const [query, setQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSignupWall, setShowSignupWall] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [searchCount, setSearchCount] = useState(0)

  useEffect(() => {
    // Reset state on mount for easy testing
    setHasSearched(false)
    setShowSignupWall(false)
    setSearchCount(0)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    // If this is the second search, show the wall
    if (searchCount >= 1) {
      setShowSignupWall(true)
      return
    }

    setIsLoading(true)
    setShowSignupWall(false)
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    const primaryPort = 3000
    const secondaryPort = 3001
    const apiUrl = `http://${hostname}:${primaryPort}/api/products/search?q=${encodeURIComponent(query)}&limit=15`
    
    try {
      console.log(`Searching via: ${apiUrl}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.products) {
        setResults(data.products)
        setHasSearched(true)
        setSearchCount(prev => prev + 1)
      } else {
        console.error("Search failed:", data.error || data.message)
        alert(data.message || "Search failed. Please try another term.")
      }
    } catch (err: any) {
      console.error("Primary fetch failed, trying secondary port:", err)
      
      // Fallback: Try secondaryPort
      try {
        const fallbackUrl = `http://${hostname}:${secondaryPort}/api/products/search?q=${encodeURIComponent(query)}&limit=15`
        console.log(`Trying fallback: ${fallbackUrl}`)
        const fallbackResponse = await fetch(fallbackUrl)
        const fallbackData = await fallbackResponse.json()
        if (fallbackData.success) {
          setResults(fallbackData.products)
          setHasSearched(true)
          setSearchCount(prev => prev + 1)
          return
        }
      } catch (fallbackErr) {
        console.error("Secondary fallback also failed:", fallbackErr)
      }

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
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try searching 'iPhone 15 Pro' or 'Sony WH-1000XM5'..."
            className="w-full pl-12 pr-32 py-4 rounded-2xl border-2 border-emerald-100 focus:border-emerald-500 bg-white dark:bg-slate-900 dark:border-slate-800 dark:focus:border-cyan-500 shadow-lg outline-none transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-emerald-500" />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {hasSearched && (
        <div className="relative mt-12 min-h-[400px]">
          {/* Results Container with Blur when Wall is Active */}
          <div className={`transition-all duration-700 ${showSignupWall ? 'blur-md pointer-events-none select-none opacity-40' : 'animate-in fade-in slide-in-from-bottom-4'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Online Stores */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-bold text-xl dark:text-white">
                  <span className="h-8 w-1 bg-emerald-500 rounded-full"></span>
                  Online Stores
                </h3>
                <div className="space-y-3">
                  {results.length > 0 ? (
                    results.slice(0, 5).map((res, i) => {
                      const minPrice = Math.min(...results.map(r => r.price_inr || Infinity));
                      const isBest = res.price_inr === minPrice;
                      
                      return (
                        <Card key={i} className={`p-3 flex flex-row items-start gap-4 border-2 transition-all ${isBest ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10 shadow-md' : 'hover:border-emerald-200 dark:hover:border-cyan-800'}`}>
                          {/* Product Image - Fixed Square */}
                          <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-gray-100 dark:border-slate-700">
                            {res.image_url ? (
                              <img 
                                src={res.image_url} 
                                alt={res.product_name} 
                                className="w-full h-full object-contain p-1"
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

                          {/* Product Info - Vertical Column */}
                          <div className="flex flex-col justify-center py-1 flex-grow min-w-0 h-24">
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight">{res.product_name}</span>
                                {isBest && (
                                  <Badge className="bg-emerald-500 text-white border-none text-[8px] h-4 px-1.5 shrink-0">BEST VALUE</Badge>
                                )}
                              </div>
                              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{res.retailer_name}</span>
                            </div>
                            <div className="mt-auto">
                              <div className="font-extrabold text-xl text-emerald-700 dark:text-cyan-400">
                                {res.price_inr ? `₹${res.price_inr.toLocaleString()}` : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-2xl">
                      No results found for your search.
                    </div>
                  )}
                </div>

                {results.length > 5 && !showSignupWall && (
                  <button 
                    onClick={() => setShowSignupWall(true)}
                    className="w-full py-3 text-emerald-600 font-bold hover:underline flex items-center justify-center gap-1"
                  >
                    View More Results <ExternalLink className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Offline Stores */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-bold text-xl dark:text-white">
                  <span className="h-8 w-1 bg-blue-500 rounded-full"></span>
                  Offline Stores
                </h3>
                <div className="relative h-64 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-emerald-50/50 dark:from-slate-900 dark:to-slate-950 -z-10" />
                  <MapPin className="h-12 w-12 text-blue-400 mb-4" />
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Coming Soon!</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Local retailer integration is currently in progress.
                  </p>
                </div>
              </div>
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
                  <Link href={`${DASHBOARD_URL}/signup`} className="flex-1">
                    <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-lg">
                      Sign Up Free
                    </Button>
                  </Link>
                  <Link href={`${DASHBOARD_URL}/login`} className="flex-1">
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
