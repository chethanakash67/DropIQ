'use client';

import React from 'react';
import Link from 'next/link';

const links = [
    { href: "/#how-it-works", label: "How it Works" },
    { href: "/#why-different", label: "Why Different" },
    { href: "/#social-proof", label: "Testimonials" },
    { href: "/#team", label: "Team" },
    { href: "/#pricing", label: "Pricing" },
];

export default function LandingNavbar() {
    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #f1f5f9',
            padding: '0 40px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            {/* Brand */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <img 
                    src="/images/founders/des-1-removebg-preview_cropped.png" 
                    alt="Logo" 
                    style={{ height: '40px', width: '40px', objectFit: 'contain' }} 
                />
                <span style={{ 
                    fontSize: '24px', 
                    fontWeight: 900, 
                    letterSpacing: '-1.2px',
                    background: 'linear-gradient(to right, #10b981, #84cc16)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    DropiQ
                </span>
            </Link>

            {/* Links - Desktop Only */}
            <div style={{ display: 'flex', gap: '8px' }}>
                {links.map(l => (
                    <Link 
                        key={l.label} 
                        href={l.href} 
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#475569',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        {l.label}
                    </Link>
                ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <Link href="/login" style={{
                    padding: '10px 24px',
                    borderRadius: '24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1e293b',
                    border: '1px solid #e2e8f0',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                }}>
                    Log In
                </Link>
                <Link href="/signup" style={{
                    padding: '10px 24px',
                    borderRadius: '24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    background: '#10b981',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                }}>
                    Sign Up
                </Link>
            </div>
        </nav>
    );
}
