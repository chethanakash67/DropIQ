'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function PageTransition() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // ONLY show loader when navigating TO the dashboard
        const isTargetDashboard = pathname === '/dashboard';
        
        if (isTargetDashboard) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            pointerEvents: 'all'
        }}>
            <DotLottieReact
                src="/cart-loading.lottie"
                loop
                autoplay
                style={{ width: '180px', height: '180px' }}
            />

            <p style={{ 
                fontSize: '12px', 
                fontWeight: 700, 
                color: '#10b981', 
                letterSpacing: '3px',
                textTransform: 'uppercase',
            }}>
                Finding the Best Deal...
            </p>
        </div>
    );
}
