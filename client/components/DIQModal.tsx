'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconLightbulb, IconArrowLeft, IconArrowRight } from '@/components/Icons';

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
    const [questions, setQuestions] = useState<DIQQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, DIQAnswer>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

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
        const newAnswer: DIQAnswer = {
            ...option,
            importance: prev?.importance ?? 50,
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
            const res = await fetch('/api/diq/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers, limit: 20 }),
            });
            const data = await res.json();
            if (data.success) {
                // Store in sessionStorage for results page
                sessionStorage.setItem('diq_results', JSON.stringify(data.products));
                sessionStorage.setItem('diq_answers', JSON.stringify(answers));
                sessionStorage.setItem('diq_questions', JSON.stringify(questions));
                onClose();
                router.push('/diq-results');
            } else {
                alert('Failed to get recommendations. Please try again.');
            }
        } catch (_) {
            alert('Failed to get recommendations. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const isLast = currentIndex === questions.length - 1;
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

    return (
        <div className="diq-modal show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="diq-modal-content">
                <button className="diq-close" onClick={onClose}>×</button>

                <div className="diq-header">
                    <h2 className="diq-title">Find Your Perfect Match</h2>
                    <p className="diq-subtitle-text">Answer a few quick questions to get personalized recommendations</p>
                </div>

                {loading && <div className="diq-loading"><div className="diq-spinner" /><p className="diq-loading-text">Loading questions...</p></div>}
                {error && <p style={{ color: '#c33', textAlign: 'center' }}>{error}</p>}

                {!loading && !error && currentQuestion && (
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
                                        <p className="diq-help-text"><IconLightbulb size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />{currentQuestion.helpText}</p>
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
                                                value={currentAnswer?.importance ?? 50}
                                                onChange={(e) => {
                                                    if (currentAnswer) {
                                                        setAnswers(prev => ({
                                                            ...prev,
                                                            [currentQuestion.id]: { ...prev[currentQuestion.id], importance: parseInt(e.target.value) }
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
            </div>
        </div>
    );
}
