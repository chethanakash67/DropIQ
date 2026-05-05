'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    lastRefreshed: string | undefined;
    refreshIntervalHours?: number;
    prefix?: string;
    style?: React.CSSProperties;
}

export default function CountdownTimer({ lastRefreshed, refreshIntervalHours = 12, prefix = 'Refills in: ', style }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!lastRefreshed) {
            setTimeLeft('--:--:--');
            return;
        }

        const updateTimer = () => {
            const lastDate = new Date(lastRefreshed);
            const refillDate = new Date(lastDate.getTime() + refreshIntervalHours * 60 * 60 * 1000);
            const now = new Date();
            
            const diff = refillDate.getTime() - now.getTime();
            
            if (diff <= 0) {
                setTimeLeft('00:00:00');
                // Optional: trigger a refresh or just show ready
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            const pad = (n: number) => n.toString().padStart(2, '0');
            setTimeLeft(`${pad(h)}:${pad(m)}:${pad(s)}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [lastRefreshed, refreshIntervalHours]);

    return (
        <span style={{ ...style, fontVariantNumeric: 'tabular-nums' }}>
            {prefix}{timeLeft}
        </span>
    );
}
