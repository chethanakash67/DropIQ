'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function OAuthCallbackContent() {
    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        const token = params.get('token');
        const refresh = params.get('refresh');
        const error = params.get('error');

        if (error) {
            router.replace(`/login?error=${error}`);
            return;
        }

        if (token && refresh) {
            localStorage.setItem('accessToken', token);
            localStorage.setItem('refreshToken', refresh);
            router.replace('/dashboard');
        } else {
            router.replace('/login?error=missing_tokens');
        }
    }, [params, router]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
            <div className="diq-spinner" style={{ width: 48, height: 48 }} />
            <p>Completing sign-in…</p>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense>
            <OAuthCallbackContent />
        </Suspense>
    );
}
