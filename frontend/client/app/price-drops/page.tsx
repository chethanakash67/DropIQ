'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

interface PriceDropProduct {
    id: string;
    product_name: string;
    price_inr: number;
    old_price: number;
    retailer_name: string;
    image_url: string;
    rating: number;
}

export default function PriceDropsPage() {
    const { currentUser, loading } = useAuth();
    const [products, setProducts] = useState<PriceDropProduct[]>([]);

    useEffect(() => {
        // Placeholder price drop data
        const placeholders = [
            { id: 'pd1', product_name: 'Apple iPhone 15 (128GB)', price_inr: 68999, old_price: 79900, retailer_name: 'Amazon', image_url: 'https://m.media-amazon.com/images/I/71d7rfSl0wL._SX679_.jpg', rating: 4.6 },
            { id: 'pd2', product_name: 'Samsung Galaxy S24 Ultra', price_inr: 109999, old_price: 129999, retailer_name: 'Flipkart', image_url: 'https://m.media-amazon.com/images/I/71RVuBr96fL._SX679_.jpg', rating: 4.7 },
            { id: 'pd3', product_name: 'Sony WH-1000XM5 Headphones', price_inr: 26990, old_price: 34990, retailer_name: 'Amazon', image_url: 'https://m.media-amazon.com/images/I/51aBtkSThFL._SX679_.jpg', rating: 4.5 },
            { id: 'pd4', product_name: 'MacBook Air M2 Chip', price_inr: 84990, old_price: 99900, retailer_name: 'Amazon', image_url: 'https://m.media-amazon.com/images/I/719C6bJv8jL._SX679_.jpg', rating: 4.8 },
            { id: 'pd5', product_name: 'iPad Air (5th Gen)', price_inr: 49990, old_price: 59900, retailer_name: 'Flipkart', image_url: 'https://m.media-amazon.com/images/I/61XZQXFQeBL._SX679_.jpg', rating: 4.6 },
            { id: 'pd6', product_name: 'Dell XPS 13 Laptop', price_inr: 94990, old_price: 114990, retailer_name: 'Amazon', image_url: 'https://m.media-amazon.com/images/I/81h90A1vVHL._SX679_.jpg', rating: 4.4 },
        ];
        setProducts(placeholders);
    }, []);

    if (loading) return null;

    if (currentUser?.planType !== 'pro' && currentUser?.planType !== 'max' && currentUser?.planType !== 'premium') {
        return (
            <div className="dashboard">
                <Navbar />
                <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
                    <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Pro Feature Only</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Upgrade to Pro to unlock real-time price drop alerts across all major retailers.</p>
                    <Link href="/plans" className="shiny-shield-btn" style={{ padding: '12px 32px', borderRadius: '12px', textDecoration: 'none' }}>View Plans</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <Navbar />
            <div className="container" style={{ paddingTop: '24px' }}>
                <Link href="/dashboard" scroll={false} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', marginBottom: '24px' }}>
                    ← Back to Dashboard
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', background: 'var(--gradient-vibrant)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Price Drop Alerts</h1>
                        <p style={{ color: 'var(--text-muted)' }}>We tracked these products dropping in price across the web in the last 24 hours.</p>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 20px', borderRadius: '16px', textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>PRO ACCESS</div>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>Active Tracking</div>
                    </div>
                </div>

                <div className="product-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '24px',
                    marginBottom: '60px'
                }}>
                    {products.map(product => (
                        <div key={product.id} style={{ position: 'relative' }}>
                            <div style={{ 
                                position: 'absolute', 
                                top: '12px', 
                                left: '12px', 
                                zIndex: 10, 
                                background: '#ef4444', 
                                color: 'white', 
                                padding: '4px 10px', 
                                borderRadius: '8px', 
                                fontSize: '12px', 
                                fontWeight: 800,
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                            }}>
                                SAVE ₹{(product.old_price - product.price_inr).toLocaleString()}
                            </div>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: '32px', padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', marginBottom: '80px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤖</div>
                    <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>AI Scrapers are active</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 24px' }}>Our deep-tracking agents are currently scanning Amazon, Flipkart, and 12+ other stores for the latest price fluctuations.</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <span style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border)' }}>Scanning Amazon...</span>
                        <span style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border)' }}>Scanning Flipkart...</span>
                        <span style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border)' }}>Syncing DB...</span>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
