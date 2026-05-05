'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

export default function FAQPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            <main style={{ flex: 1, padding: '100px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#1e293b', marginBottom: '32px' }}>Frequently Asked <span style={{ color: '#10b981' }}>Questions</span></h1>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {[
                            { q: 'Is DropIQ free to use?', a: 'Yes, searching and comparing prices on DropIQ is completely free for consumers.' },
                            { q: 'How often are prices updated?', a: 'We refresh pricing data every hour to ensure you see the most current deals.' },
                            { q: 'Do you sell products directly?', a: 'No, DropIQ is a value-analysis platform. We help you find the best deals and redirect you to the partner stores to complete your purchase.' },
                            { q: 'What is a Value Score?', a: 'Our proprietary algorithm that weighs price against historical data, features, and brand reliability.' }
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>{item.q}</h3>
                                <p style={{ color: '#64748b', lineHeight: '1.6' }}>{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}


