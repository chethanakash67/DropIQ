'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: 'Rs 0',
        subtitle: 'Best for getting started',
        credits: '20 on signup, refresh to 20 every 12 hours',
        features: ['1 premium trial teaser on landing (placeholder)', 'Standard recommendations', 'Top 2 premium picks locked'],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 'Rs 499/mo',
        subtitle: 'Most popular',
        credits: '50 credits every 12 hours',
        features: ['Full premium results unlocked', 'Better premium search efficiency', 'Priority model quality'],
    },
    {
        id: 'max',
        name: 'Max',
        price: 'Rs 999/mo',
        subtitle: 'Power users',
        credits: '75 credits every 12 hours',
        features: ['Highest LLM efficiency tier', 'Enhanced preference and cache usage', 'Best premium recommendation quality'],
        isComingSoon: true
    },
];

export default function PlansPage() {
    const { currentUser, authenticatedFetch, setCurrentUser } = useAuth();
    const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

    const handleUpgrade = async (planId: string) => {
        if (planId === 'max') return;
        
        setIsUpgrading(planId);
        setPaymentStatus('processing');

        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            const res = await authenticatedFetch('/api/auth/upgrade-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType: planId })
            });

            if (res.ok) {
                const data = await res.json();
                setPaymentStatus('success');
                setTimeout(() => {
                    setCurrentUser({ ...currentUser!, ...data.user });
                    setIsUpgrading(null);
                    setPaymentStatus('idle');
                }, 2000);
            } else {
                alert('Upgrade failed. Please try again.');
                setIsUpgrading(null);
                setPaymentStatus('idle');
            }
        } catch (err) {
            alert('Connection error');
            setIsUpgrading(null);
            setPaymentStatus('idle');
        }
    };

    return (
        <div className="dashboard">
            <Navbar />
            <div className="container" style={{ paddingTop: '24px' }}>
                <Link href="/dashboard" scroll={false} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px' }}>
                    ← Back to Dashboard
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '34px', marginBottom: '8px' }}>Choose your DropIQ plan</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Search smart with credit-based access and upgrade anytime.</p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(250px, 1fr))',
                        gap: '22px',
                        overflowX: 'auto',
                        paddingBottom: '6px'
                    }}
                >
                    {plans.map((plan) => {
                        const userPlan = currentUser?.planType || 'free';
                        const active = userPlan === plan.id || (plan.id === 'max' && userPlan === 'premium');
                        return (
                            <div key={plan.id} style={{ background: 'var(--bg-card)', border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '22px', padding: '22px', boxShadow: active ? '0 8px 25px rgba(16,185,129,0.2)' : 'var(--shadow-sm)' }}>
                                <h3 style={{ fontSize: '22px', marginBottom: '6px' }}>{plan.name}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{plan.subtitle}</p>
                                <p style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>{plan.price}</p>
                                <p style={{ fontSize: '13px', color: 'var(--accent)', marginBottom: '16px' }}>{plan.credits}</p>
                                <ul style={{ listStyle: 'none', display: 'grid', gap: '8px', marginBottom: '18px' }}>
                                    {plan.features.map((feature) => (
                                        <li key={feature} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>• {feature}</li>
                                    ))}
                                </ul>
                                {active ? (
                                    <button className="auth-button" disabled style={{ opacity: 0.7 }}>Current Plan</button>
                                ) : plan.isComingSoon ? (
                                    <button className="auth-button" disabled style={{ opacity: 0.5, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>Coming Soon</button>
                                ) : plan.id === 'free' ? (
                                    <button className="auth-button" disabled style={{ opacity: 0.5, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>Included</button>
                                ) : (
                                    <button 
                                        className="shiny-shield-btn" 
                                        disabled={!!isUpgrading}
                                        onClick={() => handleUpgrade(plan.id)}
                                    >
                                        {isUpgrading === plan.id ? 'Processing...' : `Upgrade to ${plan.name}`}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {paymentStatus !== 'idle' && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{
                            background: 'var(--bg-card)',
                            padding: '40px',
                            borderRadius: '24px',
                            border: '1px solid var(--border)',
                            textAlign: 'center',
                            maxWidth: '400px',
                            width: '100%',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                        }}>
                            {paymentStatus === 'processing' ? (
                                <>
                                    <div className="spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }} />
                                    <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Simulating Secure Payment</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Processing your transaction through our secure gateway...</p>
                                </>
                            ) : (
                                <>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white', fontSize: '30px' }}>✓</div>
                                    <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Payment Successful!</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Welcome to {isUpgrading === 'pro' ? 'Pro' : 'Max'} tier. Your credits have been updated.</p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

