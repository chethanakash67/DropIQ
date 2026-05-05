'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import CountdownTimer from '@/components/CountdownTimer';

interface InsufficientCreditsModalProps {
    open: boolean;
    onClose: () => void;
    required?: number;
    available?: number;
}

export default function InsufficientCreditsModal({ open, onClose, required = 0, available = 0 }: InsufficientCreditsModalProps) {
    const { currentUser } = useAuth();
    if (!open) return null;

    return (
        <div className="cart-modal show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="cart-modal-content" style={{ maxWidth: '460px' }}>
                <div className="cart-header">
                    <h2>Credits Exhausted</h2>
                    <button className="cart-close" onClick={onClose}>×</button>
                </div>
                <div className="cart-items" style={{ paddingBottom: 0 }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        You do not have enough credits for this action.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                        Required: <strong>{required}</strong> | Available: <strong>{available}</strong>
                    </p>
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Next Auto-Refill</div>
                        <CountdownTimer 
                            lastRefreshed={currentUser?.creditsLastRefreshed} 
                            style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '1px' }}
                        />
                    </div>
                </div>
                <div className="cart-footer" style={{ justifyContent: 'flex-end' }}>
                    <button className="cart-clear-btn" onClick={onClose}>Not Now</button>
                    <Link href="/plans" className="shiny-shield-btn" style={{ width: 'auto', padding: '10px 18px', textDecoration: 'none' }}>
                        Upgrade Plan
                    </Link>
                </div>
            </div>
        </div>
    );
}
