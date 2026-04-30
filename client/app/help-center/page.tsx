'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';

export default function HelpCenterPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            <main style={{ flex: 1, padding: '100px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#1e293b', marginBottom: '32px' }}>Help <span style={{ color: '#10b981' }}>Center</span></h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {['Getting Started', 'Account & Security', 'Deals & Savings', 'Platform API'].map(topic => (
                            <div key={topic} style={{ padding: '32px', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: '0.2s' }}
                                 onMouseOver={(e) => e.currentTarget.style.borderColor = '#10b981'}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{topic}</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Find answers and detailed guides about {topic.toLowerCase()}.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
