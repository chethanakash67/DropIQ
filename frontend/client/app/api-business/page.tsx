'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

export default function APIBusinessPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            <main style={{ flex: 1, padding: '100px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#1e293b', marginBottom: '32px' }}>API for <span style={{ color: '#10b981' }}>Businesses</span></h1>
                    <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.8' }}>
                        Empower your retail business with DropIQ&apos;s real-time pricing and market analysis API. Access millions of product data points across multiple marketplaces.
                    </p>
                    <div style={{ marginTop: '48px', display: 'grid', gap: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>Real-time Pricing</h3>
                            <p style={{ color: '#64748b' }}>Stay ahead of the competition with up-to-the-minute price tracking across all major platforms.</p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>Inventory Insights</h3>
                            <p style={{ color: '#64748b' }}>Monitor stock levels and availability trends to optimize your supply chain.</p>
                        </div>
                        <button className="shiny-shield-btn" style={{ padding: '16px 32px', borderRadius: '16px', width: 'fit-content' }}>Request API Access</button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

