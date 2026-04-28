'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconLightbulb, IconArrowLeft, IconArrowRight, IconCart, IconClipboard } from '@/components/Icons';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import InsufficientCreditsModal from './InsufficientCreditsModal';

interface DIQOption {
    id: string;
    text: string;
    spec?: string;
    description?: string;
    disabled?: boolean;
    scoring?: Record<string, unknown>;
    filters?: Record<string, unknown>;
    priceRange?: unknown;
}

interface DIQQuestion {
    id: string;
    question: string;
    helpText?: string;
    hasImportance?: boolean;
    options: DIQOption[];
}

interface DIQAnswer extends DIQOption {
    importance: number;
}

interface DIQModalProps {
    onClose: () => void;
}

export default function DIQModal({ onClose }: DIQModalProps) {
    const router = useRouter();
    const { addToCart, addToBag } = useCart();
    const { authenticatedFetch, currentUser, setCurrentUser } = useAuth();
    const [questions, setQuestions] = useState<DIQQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, DIQAnswer>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState<any[] | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [tempImportance, setTempImportance] = useState<Record<string, number>>({});
    const [creditsModalOpen, setCreditsModalOpen] = useState(false);
    const [creditErrorMeta, setCreditErrorMeta] = useState<{ required?: number; available?: number }>({});

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/diq/questions');
                const data = await res.json();
                if (data.success) {
                    setQuestions(data.questions);
                } else {
                    setError('Failed to load questions. Please try again.');
                }
            } catch (_) {
                setError('Failed to load questions. Please try again.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const currentQuestion = questions[currentIndex];
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

    const selectOption = async (option: DIQOption) => {
        const prev = answers[currentQuestion.id];
        const importance = tempImportance[currentQuestion.id] ?? prev?.importance ?? 50;
        
        const newAnswer: DIQAnswer = {
            ...option,
            importance: importance,
        };
        const newAnswers = { ...answers, [currentQuestion.id]: newAnswer };
        setAnswers(newAnswers);

        // Load category-specific questions
        if (currentQuestion.id === 'q0_category') {
            try {
                const res = await fetch(`/api/diq/questions/${option.id}`);
                const data = await res.json();
                if (data.success) setQuestions(data.questions);
            } catch (_) { }
        }
    };

    const goNext = () => {
        const ans = answers[currentQuestion.id];
        if (!ans?.id) { alert('Please select an option before proceeding.'); return; }
        if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1);
    };

    const goPrev = () => {
        if (currentIndex > 0) setCurrentIndex(i => i - 1);
    };

    const handleSubmit = async () => {
        const lastQ = questions[questions.length - 1];
        if (!answers[lastQ.id]?.id) { alert('Please select an option before submitting.'); return; }

        setSubmitting(true);
        try {
            const res = await authenticatedFetch('/api/diq/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, limit: 12 }),
            });
            const data = await res.json();
            if (res.status === 402 || data?.error === 'INSUFFICIENT_CREDITS') {
                setCreditErrorMeta({ required: data.requiredCredits, available: data.availableCredits });
                setCreditsModalOpen(true);
                return;
            }
            if (data.success) {
                if (currentUser && typeof data.credits === 'number') {
                    setCurrentUser({ ...currentUser, credits: data.credits });
                }
                setResults(data.products);
                setShowResults(true);
            } else {
                alert('Failed to get recommendations. Please try again.');
            }
        } catch (_) {
            alert('Failed to get recommendations. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getMatchReason = (product: any) => {
        // Derived from important answers
        const highImportanceAnswers = Object.values(answers)
            .filter(a => a.importance >= 70)
            .map(a => a.text);
        
        if (highImportanceAnswers.length > 0) {
            return `Matches your preference for ${highImportanceAnswers[0]}${highImportanceAnswers.length > 1 ? ` & ${highImportanceAnswers[1]}` : ''}`;
        }
        
        if (product.has_anc) return "Perfect for quiet listening with Active Noise Cancellation";
        if (product.battery_hours > 40) return "Exceptional battery life for long usage";
        
        return "Top rated match based on your quality preferences";
    };

    const isLast = currentIndex === questions.length - 1;
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

    return (
        <div className="diq-modal show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="diq-modal-content" style={{ maxWidth: showResults ? '900px' : '720px' }}>
                <button className="diq-close" onClick={onClose}>×</button>

                <div className="diq-header">
                    <h2 className="diq-title">{showResults ? 'Your Perfect Matches' : 'Find Your Perfect Match'}</h2>
                    <p className="diq-subtitle-text">
                        {showResults 
                            ? 'Top products ranked by D_IQ Score based on your preferences' 
                            : 'Answer a few quick questions to get personalized recommendations'}
                    </p>
                </div>

                {loading && <div className="diq-loading"><div className="diq-spinner" /><p className="diq-loading-text">Loading questions...</p></div>}
                {error && <p style={{ color: '#c33', textAlign: 'center' }}>{error}</p>}

                {!loading && !error && !showResults && currentQuestion && (
                    <>
                        <div className="diq-progress">
                            <div className="diq-progress-bar">
                                <div className="diq-progress-fill" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="diq-progress-text">Question {currentIndex + 1} of {questions.length}</p>
                        </div>

                        {submitting
                            ? <div className="diq-loading">
                                <div className="diq-spinner" />
                                <p className="diq-loading-text">Analyzing your preferences and calculating D_IQ scores...</p>
                            </div>
                            : <>
                                <div className="diq-question-card">
                                    <h3 className="diq-question-title">{currentQuestion.question}</h3>
                                    {currentQuestion.helpText && (
                                        <p className="diq-help-text">
                                            <IconLightbulb size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                                            {currentQuestion.helpText}
                                        </p>
                                    )}
                                    <div className="diq-options">
                                        {currentQuestion.options.map(opt => (
                                            <button
                                                key={opt.id}
                                                className={`diq-option${currentAnswer?.id === opt.id ? ' selected' : ''}`}
                                                disabled={!!opt.disabled}
                                                onClick={() => selectOption(opt)}
                                            >
                                                <div className="diq-option-title">{opt.text}</div>
                                                {opt.spec && <div className="diq-option-spec">{opt.spec}</div>}
                                                {opt.description && <div className="diq-option-description">{opt.description}</div>}
                                            </button>
                                        ))}
                                    </div>

                                    {currentQuestion.hasImportance && (
                                        <div className="diq-importance-container">
                                            <label className="diq-importance-label">
                                                How important is this to you?
                                                <span className="diq-importance-value">{currentAnswer?.importance ?? 50}%</span>
                                            </label>
                                            <input
                                                type="range"
                                                className="diq-importance-slider"
                                                min={0} max={100}
                                                value={tempImportance[currentQuestion.id] ?? currentAnswer?.importance ?? 50}
                                                style={{ '--val': `${tempImportance[currentQuestion.id] ?? currentAnswer?.importance ?? 50}%` } as React.CSSProperties}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    // Update temp status so slider moves instantly
                                                    setTempImportance(prev => ({ ...prev, [currentQuestion.id]: val }));
                                                    
                                                    // Also update existing answer if present
                                                    if (currentAnswer) {
                                                        setAnswers(prev => ({
                                                            ...prev,
                                                            [currentQuestion.id]: { ...prev[currentQuestion.id], importance: val }
                                                        }));
                                                    }
                                                }}
                                            />
                                            <div className="diq-importance-labels">
                                                <span>Not Important</span>
                                                <span>Very Important</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="diq-navigation">
                                    {currentIndex > 0
                                        ? <button className="diq-nav-button diq-prev-button" onClick={goPrev}><IconArrowLeft size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Previous</button>
                                        : <span />
                                    }
                                    {!isLast
                                        ? <button className="diq-nav-button diq-next-button" onClick={goNext}>Next<IconArrowRight size={15} style={{ marginLeft: 6, verticalAlign: 'middle' }} /></button>
                                        : <button className="diq-nav-button diq-submit-button" onClick={handleSubmit}>Get Recommendations</button>
                                    }
                                </div>
                            </>
                        }
                    </>
                )}

                {showResults && results && (
                    <div className="diq-results-container">
                        <div className="diq-results-grid-modal">
                            {results.map((p, i) => (
                                <div
                                    key={`${p.id}-${i}`}
                                    className={`diq-result-card${p.isLocked ? ' locked' : ''}`}
                                    onClick={() => {
                                        if (p.isLocked) return;
                                        onClose();
                                        router.push(`/product/${p.id}?retailer=${encodeURIComponent(p.retailer_name || p.retailer || '')}`);
                                    }}
                                >
                                    <img src={p.image_url || p.image} alt="" className={`diq-result-image${p.isLocked ? ' blurred' : ''}`} />
                                    <div className={`diq-result-name${p.isLocked ? ' blurred' : ''}`}>{p.product_name || p.name}</div>
                                    <div className={`diq-result-price${p.isLocked ? ' blurred' : ''}`}>₹{p.price_inr || p.price}</div>
                                    <div className={`diq-match-reason${p.isLocked ? ' blurred' : ''}`}>{getMatchReason(p)}</div>
                                    {p.isLocked && (
                                        <div className="locked-product-overlay">
                                            <p>Upgrade to unlock this premium pick</p>
                                        </div>
                                    )}
                                    
                                    <div className="diq-result-actions" onClick={e => e.stopPropagation()}>
                                        <button className="diq-action-btn diq-cart-btn" onClick={() => addToCart(p)} disabled={p.isLocked}>Add to Cart</button>
                                        <button className="diq-action-btn diq-bag-btn" onClick={() => addToBag(p)} disabled={p.isLocked}>Add to Bag</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                <button className="diq-nav-button diq-prev-button" onClick={() => { setShowResults(false); setCurrentIndex(questions.length - 1); }}>
                                    <IconArrowLeft size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Change Preferences
                                </button>
                        </div>
                    </div>
                )}
                <InsufficientCreditsModal
                    open={creditsModalOpen}
                    onClose={() => setCreditsModalOpen(false)}
                    required={creditErrorMeta.required}
                    available={creditErrorMeta.available}
                />
            </div>
        </div>
    );
}
