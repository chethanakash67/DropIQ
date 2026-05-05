'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

export default function CareersPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            <main style={{ flex: 1, padding: '100px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#1e293b', marginBottom: '32px' }}>Careers at <span style={{ color: '#10b981' }}>DropIQ</span></h1>
                    <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.8', marginBottom: '48px' }}>
                        Join us in our mission to revolutionize the way people shop. We&apos;re looking for passionate individuals to help us build the future of value-based e-commerce.
                    </p>
                    
                    <div style={{ padding: '60px', background: 'white', borderRadius: '32px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🚀</div>
                        <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>No Openings Right Now</h3>
                        <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                            We aren&apos;t currently hiring, but we&apos;re always looking for talent. Check back soon or send your resume to dropiqofficial@gmail.com
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

