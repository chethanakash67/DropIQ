'use client';

import React from 'react';
import { AlertCircle, Trash2, LogOut, Info, X } from 'lucide-react';

interface PremiumAlertProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
}

export default function PremiumAlert({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel'
}: PremiumAlertProps) {
    if (!isOpen) return null;

    // Theme-aligned color palette
    const colors = {
        danger: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
        warning: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        info: { main: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
        success: { main: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
    };

    const activeColor = colors[type].main;
    const activeBg = colors[type].bg;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
            
            <div style={{
                background: 'white',
                width: '100%',
                maxWidth: '420px',
                borderRadius: '40px',
                padding: '40px',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)',
                animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div style={{ 
                    width: '72px', 
                    height: '72px', 
                    background: activeBg, 
                    borderRadius: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 28px',
                    color: activeColor
                }}>
                    {type === 'danger' ? <Trash2 size={36} /> : 
                     type === 'warning' ? <AlertCircle size={36} /> : 
                     type === 'success' ? <AlertCircle size={36} /> : 
                     <Info size={36} />}
                </div>

                <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.8px' }}>
                    {title}
                </h3>
                
                <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6', marginBottom: '40px' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                        onClick={() => { if(onConfirm) onConfirm(); onClose(); }}
                        style={{ 
                            background: activeColor, 
                            color: 'white', 
                            border: 'none', 
                            padding: '18px', 
                            borderRadius: '20px', 
                            fontSize: '15px', 
                            fontWeight: 800, 
                            cursor: 'pointer',
                            boxShadow: `0 12px 20px -5px ${activeColor}50`,
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {confirmText}
                    </button>
                    {onConfirm && (
                        <button 
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            {cancelText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
