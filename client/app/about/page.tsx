'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            
            <main style={{ flex: 1, padding: '100px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#1e293b', marginBottom: '32px', letterSpacing: '-1.5px' }}>
                        About <span style={{ background: 'linear-gradient(to right, #10b981, #84cc16)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DropIQ</span>
                    </h1>
                    
                    <div style={{ color: '#475569', fontSize: '18px', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <p>
                            DropIQ was born out of a simple observation: buying gadgets shouldn't be a gamble. As students and tech enthusiasts, we found ourselves constantly jumping between dozen of tabs, trying to figure out if we were actually getting a good deal or just falling for marketing hype.
                        </p>
                        
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginTop: '24px' }}>Our Mission</h2>
                        <p>
                            Our mission is to bring transparency to the e-commerce landscape. We believe every product has a true value, and our job is to help you find the marketplace that honors that value, without the hidden costs or inflated price tags.
                        </p>
                        
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginTop: '24px' }}>What We Do</h2>
                        <p>
                            We don't just compare prices; we analyze value. By bridging the gap between massive online marketplaces and local offline retailers, we provide a holistic view of the market. Our proprietary Value Score takes into account not just the price, but the features, reliability, and location-based availability of every product.
                        </p>
                        
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginTop: '24px' }}>The Team</h2>
                        <p>
                            We are a team of students and engineers dedicated to building tools that empower consumers. DropIQ is our way of giving back to the community by making smart shopping accessible to everyone.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}


