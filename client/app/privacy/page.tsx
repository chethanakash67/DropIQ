'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            
            <main style={{ flex: 1, padding: '120px 24px 80px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '64px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#1e293b', marginBottom: '16px', letterSpacing: '-2px' }}>Privacy Policy</h1>
                        <p style={{ color: '#64748b', fontSize: '18px', fontWeight: 500 }}>Effective Date: April 26, 2026 | Platform: DropIQ, Bengaluru, India</p>
                    </div>
                    
                    <div className="policy-content" style={{ 
                        color: '#334155', 
                        fontSize: '17px', 
                        lineHeight: '1.8', 
                        background: 'white', 
                        padding: '60px', 
                        borderRadius: '32px', 
                        boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(16, 185, 129, 0.1)'
                    }}>
                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>1. Introduction</h2>
                            <p>DropIQ ("we", "our", "us") is committed to protecting the privacy of every user who accesses our hyperlocal price comparison platform. This Privacy Policy describes the categories of information we collect, the purposes for which we collect it, how it is stored and protected, and the rights available to you as a data subject under applicable Indian law, including the Digital Personal Data Protection Act, 2023.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>2. Information We Collect</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>2.1 Information You Provide Directly</h3>
                                    <p>When you use DropIQ, you may voluntarily submit information including your name, email address, and preference inputs such as feature weightings in the DropIQ Score engine. If you participate in our scout or contributor program, you may also submit product data, receipt photographs, and barcode scan data.</p>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>2.2 Information Collected Automatically</h3>
                                    <p>When you access our platform, we automatically collect technical data including your IP address, browser type, device type, operating system, referring URLs, and session activity logs. This information is used solely for platform diagnostics, performance optimization, and aggregate analytics.</p>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>2.3 Location Information</h3>
                                    <p>DropIQ is a hyperlocal platform. To surface nearby offline store prices within your defined radius, we request access to your approximate location. This is collected only with your explicit consent and is not stored beyond the active session unless you opt into persistent location preferences.</p>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>2.4 Crowdsourced and Scout-Submitted Data</h3>
                                    <p>If you submit pricing data through barcode scans, receipt uploads, or manual entries as a DropIQ community contributor, that data becomes part of our product and pricing database. Submissions are attributed to a contributor profile only with your consent. Raw receipt images are processed for price extraction and are not retained beyond 72 hours of submission.</p>
                                </div>
                            </div>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>3. How We Use Your Information</h2>
                            <p style={{ marginBottom: '16px' }}>We use collected information for the following purposes:</p>
                            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <li>To operate and improve the DropIQ price comparison engine</li>
                                <li>To compute and display personalized DropIQ Scores based on your declared feature preferences</li>
                                <li>To surface relevant offline and online store pricing within your geographic radius</li>
                                <li>To maintain and grow our product SKU database through community contributions</li>
                                <li>To send transactional communications such as price drop alerts and watchlist notifications, where you have opted in</li>
                                <li>To generate aggregated, anonymized analytics for internal product decisions and, in later phases, B2B intelligence reports for brands</li>
                            </ul>
                            <p style={{ marginTop: '16px' }}>We do not use your data for automated individual profiling in ways that produce legal or similarly significant effects without your consent.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>4. Data Sharing and Disclosure</h2>
                            <p style={{ marginBottom: '16px' }}>DropIQ does not sell your personal data to third parties under any circumstance. We may share data in the following limited contexts:</p>
                            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <li>With technology service providers (hosting, analytics, OCR processing) under strict data processing agreements</li>
                                <li>With affiliated brand partners in anonymized, aggregated form only as part of our B2B data product offering</li>
                                <li>With law enforcement or regulatory authorities where required by applicable Indian law</li>
                                <li>In the event of a business acquisition or merger, with appropriate notice to users</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>5. Data Retention</h2>
                            <p>Personal data is retained only as long as necessary for the stated purpose. Preference data and session history are retained for up to 12 months to enable behavioral learning features. Receipt images are deleted within 72 hours. You may request deletion of your account and associated data at any time.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>6. Your Rights</h2>
                            <p>Under the Digital Personal Data Protection Act, 2023, you have the right to access, correct, and erase your personal data. You also have the right to withdraw consent for any processing that is consent-based, and to nominate a representative to exercise these rights on your behalf. To exercise any of these rights, contact us at <strong>privacy@dropiq.in</strong>.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>7. Cookies and Local Storage</h2>
                            <p>DropIQ uses browser local storage to retain your preference profile and session state across visits. We do not use third-party advertising cookies. Analytics are collected through privacy-respecting tools with IP anonymization enabled.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>8. Security</h2>
                            <p>We implement industry-standard technical and organizational measures to protect your data, including HTTPS encryption in transit, access controls on our databases, and regular security reviews. No system is completely secure, and we encourage you to use a strong, unique password if account features are introduced in future versions.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>9. Children's Privacy</h2>
                            <p>DropIQ is not directed at individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has submitted data through our platform, contact us immediately and we will delete it.</p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>10. Changes to This Policy</h2>
                            <p>We may update this Privacy Policy as the platform evolves. Material changes will be communicated via a banner notification on the platform. Continued use after the effective date of a revised policy constitutes acceptance of the updated terms.</p>
                        </section>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
