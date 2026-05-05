'use client';

import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';

export default function ConsumerPolicyPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', flexDirection: 'column' }}>
            <LandingNavbar />
            
            <main style={{ flex: 1, padding: '120px 24px 80px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '64px', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#1e293b', marginBottom: '16px', letterSpacing: '-2px' }}>Consumer Policy</h1>
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
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>1. Purpose</h2>
                            <p>This Consumer Policy outlines the standards and commitments DropIQ maintains toward its users as a price comparison platform operating in India. It is designed to ensure that every user interacts with DropIQ with a clear understanding of what the platform is, what it is not, and what protections are in place for their benefit.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>2. Nature of Service</h2>
                            <p>DropIQ is a price discovery and comparison tool. It is not a seller, marketplace, or transaction facilitator. We do not hold inventory, process payments, or enter into any commercial contract on behalf of users. Any purchase made at a store discovered through DropIQ is a direct transaction between the user and that store or retailer, governed entirely by that store&apos;s own policies.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>3. Price Accuracy and Freshness</h2>
                            <p>DropIQ displays prices sourced from online scrapers, community scout submissions, and store self-serve listings. Every price card on the platform carries a data freshness label indicating when the price was last verified. Users are strongly advised to confirm the price directly with the retailer before visiting a store or completing a purchase. DropIQ is not responsible for price discrepancies between what is displayed on the platform and what is charged at point of sale.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>4. DropIQ Score Transparency</h2>
                            <p>The DropIQ Score is a user-configurable weighted scoring system. It reflects how well a product matches your declared preferences, not an objective quality rating. Two users with different preference inputs will receive different scores for the same product. DropIQ commits to maintaining full transparency about what factors constitute the score and how weights are applied. We will never manipulate scores on behalf of any brand or advertiser.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>5. Offline Store Listings</h2>
                            <p>Offline store data on DropIQ is sourced through community scouts, store self-serve submissions, and direct outreach. We verify new store listings manually before publishing. However, store hours, stock availability, and quoted prices are subject to change without notice. DropIQ recommends calling ahead before visiting a store based on a platform listing.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>6. Grievance Redressal</h2>
                            <p style={{ marginBottom: '16px' }}>In accordance with the Consumer Protection Act, 2019, DropIQ has designated a Grievance Officer for consumer complaints related to the platform. If you believe that displayed data is inaccurate, that your contributor submission was handled unfairly, or that your data rights have been violated, you may contact our Grievance Officer at:</p>
                            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <p style={{ fontWeight: 700, marginBottom: '4px' }}>Grievance Officer: DropIQ Support Team</p>
                                <p style={{ marginBottom: '4px' }}>Email: <strong>grievance@dropiq.in</strong></p>
                                <p style={{ fontSize: '14px', color: '#64748b' }}>Response Time: Within 48 hours of receipt of complaint</p>
                            </div>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>7. No Dark Patterns</h2>
                            <p>DropIQ commits to zero use of deceptive design patterns. We will not use false urgency, hidden charges, misleading comparisons, or manipulative defaults to influence user decisions. Our interface is designed to surface the most relevant and accurate information, not to drive engagement at the cost of user trust.</p>
                        </section>

                        <section style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>8. Community Contributor Fairness</h2>
                            <p>Scout and contributor participants are treated as valued community members. Internship certificates and letters issued are genuine documents. Leaderboard rankings are computed transparently. DropIQ will not revoke contributor credentials without documented cause and will notify the contributor of any such decision.</p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>9. Platform Availability</h2>
                            <p>DropIQ is a beta-stage platform and may experience downtime, data gaps, or feature unavailability. We commit to communicating planned maintenance in advance and to resolving unplanned outages within 24 hours. Users are advised not to rely solely on DropIQ for time-sensitive purchasing decisions.</p>
                        </section>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
