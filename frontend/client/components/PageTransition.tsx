'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Lottie from 'lottie-react';
import cartLoadingAnimation from '../public/cart-loading.json';

// Module-level variable to track if the dashboard has already been "seen" in this session
// This survives navigation but is reset on hard refresh (F5)
let hasSeenDashboard = false;

export default function PageTransition() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [isFirstEntry, setIsFirstEntry] = useState(false);

    useEffect(() => {
        const isTargetDashboard = pathname === '/dashboard';
        const justLoggedIn = sessionStorage.getItem('just_logged_in') === 'true';
        
        // Show loader ONLY on hard refresh (hasSeenDashboard is false) or login
        if (isTargetDashboard && (!hasSeenDashboard || justLoggedIn)) {
            setIsVisible(true);
            setIsFirstEntry(justLoggedIn);
            hasSeenDashboard = true;
            
            const startTime = Date.now();
            const handleReady = () => {
                // If just logged in, keep it a bit longer for the "wow" factor
                // If just a refresh, hide it as soon as the data is ready
                const MIN_DURATION = justLoggedIn ? 1800 : 0;
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, MIN_DURATION - elapsed);
                
                setTimeout(() => {
                    setIsVisible(false);
                    sessionStorage.removeItem('just_logged_in');
                }, remaining);
            };

            const fallback = setTimeout(() => setIsVisible(false), 5000);
            window.addEventListener('dashboard-ready', handleReady);
            return () => {
                window.removeEventListener('dashboard-ready', handleReady);
                clearTimeout(fallback);
            };
        } else {
            setIsVisible(false);
        }
    }, [pathname]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '24px',
            pointerEvents: 'all'
        }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Always show the custom CSS Pulser for immediate feedback */}
                <div className="loader-fallback-pulser" style={{ 
                    position: 'absolute',
                    width: '140px',
                    height: '140px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    borderRadius: '50%',
                    zIndex: 0
                }} />
                
                {isFirstEntry ? (
                    <Lottie
                        animationData={cartLoadingAnimation}
                        loop
                        autoplay
                        style={{ width: '180px', height: '180px', zIndex: 1 }}
                    />
                ) : (
                    <img src="/dropiq-logo-black.png" alt="Loading" style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'contain', 
                        zIndex: 1,
                        filter: 'grayscale(1) brightness(0.5)'
                    }} />
                )}
            </div>

            <p style={{ 
                fontSize: '13px', 
                fontWeight: 800, 
                color: '#10b981', 
                letterSpacing: '4px',
                textTransform: 'uppercase',
                textAlign: 'center',
                animation: 'loader-pulse 2s infinite ease-in-out'
            }}>
                Finding the Best Deal...
            </p>
        </div>
    );
}
