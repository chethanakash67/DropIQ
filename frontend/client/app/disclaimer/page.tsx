'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

export default function DisclaimerPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            
            <main style={{ flex: 1, padding: '120px 24px 80px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '64px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#1e293b', marginBottom: '16px', letterSpacing: '-2px' }}>Disclaimer</h1>
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
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>1. General Disclaimer</h2>
                            <p>The information provided on the DropIQ platform is intended solely for general informational and price comparison purposes. DropIQ makes no representations or warranties of any kind, express or implied, regarding the completeness, accuracy, reliability, suitability, or availability of any information, product data, pricing, or related content displayed on the platform.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>2. Pricing Information</h2>
                            <p>All prices displayed on DropIQ are sourced from automated web scrapers, community contributors, and store submissions. These prices are indicative and may not reflect real-time availability or current in-store pricing. DropIQ expressly disclaims any liability for financial loss, wasted travel, or purchasing decisions made in reliance on platform data without independent verification.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>3. DropIQ Score</h2>
                            <p>The DropIQ Score is a proprietary algorithmic output based on user-inputted preferences and community-submitted feature ratings. It does not constitute a professional product review, an endorsement, or a guarantee of product quality. DropIQ is not affiliated with any audio brand or retailer and does not receive compensation for Score rankings.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>4. Third-Party Websites and Retailers</h2>
                            <p>DropIQ may display links to or information sourced from third-party websites including Amazon, Flipkart, Sony, Samsung, Croma, and others. These third parties are independent entities and DropIQ has no control over their content, pricing policies, stock availability, or terms of sale. The inclusion of any third-party retailer on DropIQ does not constitute endorsement of that retailer or its products.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>5. Offline Store Information</h2>
                            <p>Information about offline stores, including store names, addresses, contact details, and product prices, is collected through community scouts and store self-submissions. DropIQ does not independently audit offline store data for every update cycle. Users should treat offline store information as a starting point for discovery, not as a guaranteed current record.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>6. Community-Submitted Data</h2>
                            <p>DropIQ relies in part on data submitted by community members including barcode scans, receipt photographs, and manual price entries. While submissions are reviewed for plausibility, DropIQ cannot guarantee the accuracy of every user-submitted data point. Decisions made based on community-sourced data are at the user&apos;s own discretion and risk.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>7. Investment and Commercial Decisions</h2>
                            <p>Nothing on DropIQ constitutes financial, investment, or commercial advice. Brands, retailers, or investors who reference DropIQ data for business decisions do so at their own risk. B2B intelligence reports, where offered, are provided as market observations and not as professional advisory products.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>8. Beta Platform Status</h2>
                            <p>DropIQ is currently operating as a beta product. Features may be incomplete, data coverage may be limited to select product categories and geographies, and the platform may undergo significant changes without prior notice. Users engaging with DropIQ during this phase accept the inherent limitations of an early-stage product.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>9. Limitation of Liability</h2>
                            <p>Under no circumstances shall DropIQ, its founders, contributors, or affiliated parties be held liable for any direct, indirect, incidental, or consequential damages arising from the use of or inability to use the platform, reliance on any displayed pricing or scoring information, or interactions with third-party retailers discovered through the platform.</p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>10. Contact</h2>
                            <p>For any queries related to this Disclaimer or any other platform policy, contact us at <strong>legal@dropiq.in</strong>.</p>
                        </section>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
