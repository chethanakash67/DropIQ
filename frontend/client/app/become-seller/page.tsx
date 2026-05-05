'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

export default function BecomeSellerPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            <main style={{ flex: 1, padding: '100px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#1e293b', marginBottom: '32px' }}>Become a <span style={{ color: '#10b981' }}>Seller</span></h1>
                    <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.8' }}>
                        List your products on DropIQ and reach thousands of smart shoppers looking for the best deals.
                    </p>
                    <div style={{ marginTop: '48px', background: 'white', padding: '48px', borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>Why sell with us?</h3>
                        <ul style={{ display: 'grid', gap: '16px', listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569' }}>✓ Direct access to value-conscious buyers</li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569' }}>✓ Real-time competitive analysis</li>
                            <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#475569' }}>✓ Easy catalog integration</li>
                        </ul>
                        <button className="shiny-shield-btn" style={{ marginTop: '40px', padding: '16px 32px', borderRadius: '16px' }}>Start Selling Today</button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}


