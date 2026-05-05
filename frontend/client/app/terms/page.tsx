'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            
            <main style={{ flex: 1, padding: '120px 24px 80px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '64px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#1e293b', marginBottom: '16px', letterSpacing: '-2px' }}>Terms of Service</h1>
                        <p style={{ color: '#64748b', fontSize: '18px', fontWeight: 500 }}>Effective Date: April 26, 2026 | Platform: DropIQ, Bengaluru, India</p>
                    </div>
                    
                    <div style={{ 
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
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
                            <p>By accessing or using the DropIQ platform, whether via web browser or progressive web application, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue use immediately. These terms constitute a legally binding agreement between you and DropIQ.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>2. Description of Service</h2>
                            <p>DropIQ is a hyperlocal price comparison platform that aggregates product pricing data from both online retailers (Amazon, Flipkart, Sony, Samsung, and others) and offline stores within a user-defined geographic radius. The platform provides a proprietary scoring mechanism called the DropIQ Score, which ranks products based on user-declared feature preferences. DropIQ is currently in beta and operates exclusively in Bengaluru, India, with audio gadgets as its primary product vertical.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>3. Eligibility</h2>
                            <p>You must be at least 18 years of age to use DropIQ. By using the platform, you represent and warrant that you meet this requirement and that all information you submit is accurate and truthful.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>4. User Conduct</h2>
                            <p style={{ marginBottom: '16px' }}>You agree not to:</p>
                            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <li>Scrape, crawl, or systematically extract data from DropIQ without express written permission</li>
                                <li>Submit false, misleading, or fabricated pricing data as a community contributor or scout</li>
                                <li>Attempt to manipulate DropIQ Scores through artificial or coordinated submissions</li>
                                <li>Reverse engineer, decompile, or attempt to access proprietary algorithms including the DropIQ Score engine</li>
                                <li>Use the platform for any unlawful purpose or in violation of any applicable regulation</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>5. Community Contributor Terms</h2>
                            <p>Users who participate in the DropIQ scout or contributor program agree that all pricing data, barcode scans, and receipt submissions they provide are accurate to the best of their knowledge. DropIQ reserves the right to reject, flag, or remove submissions that appear inaccurate, duplicated, or submitted in bad faith. Contributor credentials including internship certificates and letters are issued at DropIQ&apos;s sole discretion and do not constitute an employment or contractual relationship.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>6. Intellectual Property</h2>
                            <p>All content on the DropIQ platform, including but not limited to the DropIQ Score algorithm, UI design, product database structure, and brand assets, is the exclusive intellectual property of DropIQ. Product names, brand names, and trademarks referenced on the platform belong to their respective owners. DropIQ does not claim ownership over third-party brand assets displayed for comparison purposes.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>7. Pricing Data Accuracy</h2>
                            <p>DropIQ aggregates pricing data from multiple sources including web scrapers, community submissions, and store self-serve listings. While we make reasonable efforts to ensure accuracy and freshness, we do not guarantee that any displayed price is current, available, or accurate at the time of purchase. All prices should be independently verified before completing a transaction. DropIQ is a comparison tool, not a retailer, and does not facilitate or guarantee any purchase transaction.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>8. Affiliate Links and Commercial Relationships</h2>
                            <p>In future phases, DropIQ may display affiliate links to online retailers. Clicking such links and completing a purchase may result in DropIQ earning a commission at no additional cost to you. Affiliate relationships do not influence DropIQ Score rankings, which are determined solely by your declared preferences and community data.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>9. Limitation of Liability</h2>
                            <p>To the fullest extent permitted by applicable law, DropIQ shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of your use of the platform, including but not limited to losses arising from reliance on displayed pricing data, failed transactions at third-party stores, or temporary platform unavailability.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>10. Termination</h2>
                            <p>DropIQ reserves the right to suspend or terminate access to the platform for any user who violates these Terms of Service, submits fraudulent data, or engages in conduct harmful to the DropIQ community, without prior notice.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>11. Governing Law</h2>
                            <p>These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka.</p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>12. Amendments</h2>
                            <p>DropIQ may modify these Terms at any time. Continued use of the platform following notification of changes constitutes acceptance of the revised terms.</p>
                        </section>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
