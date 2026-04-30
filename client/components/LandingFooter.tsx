'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingFooter() {
    return (
        <footer style={{
            borderTop: '1px solid #f1f5f9',
            background: 'white',
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
                            style={{ height: '32px', width: '32px', objectFit: 'contain' }} 
                        />
                        <span style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b' }}>DropiQ</span>
                    </div>
                    <p style={{ 
                        marginTop: '16px', 
                        color: '#64748b', 
                        fontSize: '15px', 
                        lineHeight: '1.6',
                        maxWidth: '400px'
                    }}>
                        We compare online and offline stores according to your location to find the most affordable price, so you can buy with confidence.
                    </p>
                </div>

                <div>
                    <h4 style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '16px' }}>Company</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link href="/about" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>About</Link></li>
                        <li><Link href="/contact" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '16px' }}>Legal</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link href="/privacy" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link></li>
                        <li><Link href="/terms" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>Terms</Link></li>
                    </ul>
                </div>
            </div>

            <div style={{ 
                marginTop: '60px', 
                textAlign: 'center', 
                borderTop: '1px solid #f1f5f9', 
                paddingTop: '24px',
                color: '#94a3b8',
                fontSize: '12px'
            }}>
                © {new Date().getFullYear()} DropiQ. All rights reserved.
            </div>
        </footer>
    );
}
