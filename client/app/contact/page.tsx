'use client';

import React, { useState } from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
    const [status, setStatus] = useState('');

    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            
            <main style={{ flex: 1, padding: '100px 20px' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#1e293b', marginBottom: '16px', letterSpacing: '-1px' }}>Contact Us</h1>
                    <p style={{ color: '#64748b', marginBottom: '32px' }}>Have questions or feedback? We'd love to hear from you.</p>
                    
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={(e) => { e.preventDefault(); setStatus('Message sent! We will get back to you soon.'); }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Name</label>
                            <input type="text" placeholder="Your Name" required style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Email</label>
                            <input type="email" placeholder="you@example.com" required style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Message</label>
                            <textarea placeholder="How can we help?" required style={{ width: '100%', minHeight: '150px', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', resize: 'vertical' }} />
                        </div>
                        
                        <button type="submit" style={{ padding: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', transition: '0.2s' }}>
                            Send Message
                        </button>
                    </form>
                    
                    {status && <div style={{ marginTop: '24px', padding: '12px', background: '#f0fdf4', color: '#166534', borderRadius: '12px', fontSize: '14px', textAlign: 'center' }}>{status}</div>}
                    
                    <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Alternatively, reach us at <span style={{ color: '#10b981', fontWeight: 600 }}>dropiqofficial@gmail.com</span></p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}


