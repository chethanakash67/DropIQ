'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';

export default function HowToPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            <main style={{ flex: 1, padding: '100px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#1e293b', marginBottom: '32px' }}>How to use <span style={{ color: '#10b981' }}>DropIQ</span></h1>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                        {[
                            { step: '1', title: 'Search for a Product', desc: 'Enter any product name, brand, or model in the search bar on your dashboard.' },
                            { step: '2', title: 'Compare Value Scores', desc: 'We analyze price, features, and reliability to give you a Value Score for every deal.' },
                            { step: '3', title: 'Find the Best Store', desc: 'See which marketplace (Amazon, Flipkart, etc.) or local retailer offers the best price right now.' },
                            { step: '4', title: 'Direct Checkout', desc: 'Click through to the store listing and complete your purchase with confidence.' }
                        ].map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: '32px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, flexShrink: 0 }}>
                                    {s.step}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{s.title}</h3>
                                    <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6' }}>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
