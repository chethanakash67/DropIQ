'use client';

import Lottie from 'lottie-react';
import cartLoadingAnimation from '../public/cart-loading.json';

type AuthLottieLoaderProps = {
    message: string;
};

export default function AuthLottieLoader({ message }: AuthLottieLoaderProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100000,
                background: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(14px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '20px',
                pointerEvents: 'all'
            }}
        >
            <div style={{ position: 'relative', width: '210px', height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                    className="loader-fallback-pulser"
                    style={{
                        position: 'absolute',
                        width: '142px',
                        height: '142px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        borderRadius: '50%'
                    }}
                />
                <Lottie
                    animationData={cartLoadingAnimation}
                    loop
                    autoplay
                    style={{ width: '190px', height: '190px', position: 'relative' }}
                />
            </div>

            <p style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 800,
                color: '#10b981',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                textAlign: 'center',
                animation: 'loader-pulse 2s infinite ease-in-out'
            }}>
                {message}
            </p>
        </div>
    );
}
