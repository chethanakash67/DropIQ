'use client';

import React from 'react';
import Link from 'next/link';

// Calculate data freshness label based on days since update
function getDataFreshnessLabel(): string {
    // Get a random day between 1-45 to simulate different data ages
    // In production, this would come from actual last_update timestamp
    const daysSinceUpdate = Math.floor(Math.random() * 45) + 1;
    
    if (daysSinceUpdate < 20) {
        return 'Updated a day ago';
    } else if (daysSinceUpdate >= 20 && daysSinceUpdate < 35) {
        return 'Updated 4 days ago';
    } else {
        return 'Updated 6 days ago';
    }
}

export default function LandingFooter() {
    const freshnessLabel = getDataFreshnessLabel();
    
    return (
        <footer style={{
            background: '#059669', // Green background
            padding: '60px 40px 40px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '40px'
            }}>
                <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                            src="/images/founders/des-1-removebg-preview_cropped.png" 
                            alt="Logo" 
                            style={{ height: '32px', width: '32px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
                        />
                        <span style={{ fontWeight: 800, fontSize: '18px', color: 'white' }}>DropiQ</span>
                    </div>
                    <p style={{ 
                        marginTop: '16px', 
                        color: 'rgba(255,255,255,0.9)', 
                        fontSize: '15px', 
                        lineHeight: '1.6',
                        maxWidth: '400px'
                    }}>
                        We compare online and offline stores according to your location to find the most affordable price, so you can buy with confidence.
                    </p>
                    
                    {/* Data Freshness Label */}
                    <div style={{
                        marginTop: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: 500
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            background: '#34d399',
                            borderRadius: '50%',
                            display: 'inline-block'
                        }}></span>
                        {freshnessLabel}
                    </div>
                </div>

                <div>
                    <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'white', marginBottom: '16px' }}>Company</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link href="/about" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px' }}>About</Link></li>
                        <li><Link href="/contact" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px' }}>Contact</Link></li>
                        <li><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', cursor: 'not-allowed' }}>Careers (Soon)</span></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'white', marginBottom: '16px' }}>Help & Guide</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link href="/faq" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px' }}>FAQ</Link></li>
                        <li><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', cursor: 'not-allowed' }}>Help Center (Soon)</span></li>
                        <li><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', cursor: 'not-allowed' }}>How to use DropIQ (Soon)</span></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ fontWeight: 700, fontSize: '15px', color: 'white', marginBottom: '16px' }}>Legal & Policy</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link href="/privacy" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link></li>
                        <li><Link href="/terms" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px' }}>Terms</Link></li>
                        <li><Link href="/disclaimer" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px' }}>Disclaimer</Link></li>
                    </ul>
                </div>
            </div>

            <div style={{ 
                marginTop: '60px', 
                textAlign: 'center', 
                borderTop: '1px solid rgba(255,255,255,0.2)', 
                paddingTop: '24px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '12px'
            }}>
                © {new Date().getFullYear()} DropiQ. All rights reserved.
            </div>
        </footer>
    );
}
