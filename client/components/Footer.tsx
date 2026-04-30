'use client';

import React from 'react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';

export default function Footer() {
    const { currentUser } = useAuth() || {};

    return (
        <footer style={{
            background: 'var(--bg-card)',
            padding: '80px 24px 32px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            marginTop: 'auto',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            borderTop: '1px solid var(--border)'
        }}>
            {/* Subtle Texture Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.03,
                pointerEvents: 'none',
                background: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")'
            }} />

            <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    gap: '48px',
                    marginBottom: '64px'
                }}>
                    {/* Brand & Mission */}
                    <div>
                        <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', cursor: 'pointer' }} 
                            onClick={() => window.location.href = currentUser ? '/dashboard' : '/'}
                        >
                            <img src="/dropiq-logo-black.png" alt="DropIQ" style={{ height: '54px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                            <span style={{ fontSize: '36px', fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>DropIQ</span>
                        </div>
                        <p style={{ lineHeight: '1.8', maxWidth: '300px', color: 'rgba(255, 255, 255, 0.7)' }}>
                            We help students easily compare prices and features across the latest gadgets. 
                            Our goal is to ensure you always get the smartest deal without compromising quality.
                        </p>
                        
                        <div style={{ marginTop: '24px' }}>
                            <h4 style={{ fontWeight: 700, color: 'white', marginBottom: '8px' }}>Contact Us</h4>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Email: dropiqofficial@gmail.com</p>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div>
                        <h4 style={{ fontWeight: 700, color: 'white', marginBottom: '20px', fontSize: '16px' }}>Company</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="/about" style={{ textDecoration: 'none', color: 'inherit' }} className="footer-link">About Us</Link></li>
                            <li style={{ opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' }}>
                                <span style={{ color: 'inherit' }}>API for Businesses <span style={{ fontSize: '10px', verticalAlign: 'middle' }}>(Soon)</span></span>
                            </li>
                            <li style={{ opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' }}>
                                <span style={{ color: '#10b981', fontWeight: 600 }}>Become a Seller <span style={{ fontSize: '10px', verticalAlign: 'middle' }}>(Soon)</span></span>
                            </li>
                            <li style={{ opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' }}>
                                <span style={{ color: 'inherit' }}>Careers <span style={{ fontSize: '10px', verticalAlign: 'middle' }}>(Soon)</span></span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 700, color: 'white', marginBottom: '20px', fontSize: '16px' }}>Help & Guide</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="/help-center" style={{ textDecoration: 'none', color: 'inherit' }} className="footer-link">Help Center</Link></li>
                            <li><Link href="/how-to" style={{ textDecoration: 'none', color: 'inherit' }} className="footer-link">How to use this?</Link></li>
                            <li><Link href="/faq" style={{ textDecoration: 'none', color: 'inherit' }} className="footer-link">FAQ</Link></li>
                            <li><Link href="/contact" style={{ textDecoration: 'none', color: 'inherit' }} className="footer-link">Contact Form</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 700, color: 'white', marginBottom: '20px', fontSize: '16px' }}>Legal & Policy</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }} className="footer-link">Privacy Policy</Link></li>
                            <li><Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }} className="footer-link">Terms of Service</Link></li>
                            <li><Link href="/consumer-policy" style={{ textDecoration: 'none', color: 'inherit' }} className="footer-link">Consumer Policy</Link></li>
                            <li><Link href="/disclaimer" style={{ textDecoration: 'none', color: 'inherit' }} className="footer-link">Disclaimer</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar: Payments & Copyright */}
                <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingTop: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '24px'
                }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'white' }}>100% Secure Payments</span>
                         <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, fontSize: '12px', color: 'white' }}>Stripe</span>
                            <span style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, fontSize: '12px', color: 'white', fontStyle: 'italic' }}>PayPal</span>
                            <span style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, fontSize: '12px', color: 'white' }}>MasterCard</span>
                            <span style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, fontSize: '12px', color: 'white' }}>Visa</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <a href="#" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none' }}>Twitter/X</a>
                        <a href="https://www.github.com/Sai-Videsh/dropiq" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none' }}>GitHub</a>
                        <a href="https://www.linkedin.com/company/dropiq25/" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none' }}>LinkedIn</a>
                    </div>
                </div>

                <div style={{ marginTop: '32px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>
                    © {new Date().getFullYear()} DropIQ. Designed and Developed by Videsh and Akash. All rights reserved.
                </div>
            </div>
            <style jsx>{`
                .footer-link:hover {
                    color: white !important;
                    text-decoration: underline !important;
                }
            `}</style>
        </footer>
    );
}

