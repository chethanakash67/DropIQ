/**
 * D_IQ Questionnaire Configuration - All Categories Supported
 * Questions designed around real product specifications in our inventory
 * Supports: Earbuds/TWS, Headphones, Neckbands, and Wired Earphones
 */

const diqQuestions = {
  // First question - Category Selection
  category: {
    id: 'q0_category',
    question: 'What are you looking for?',
    required: true,
    options: [
      { id: 'earbuds', text: 'Earbuds / TWS (True Wireless Stereo)' },
      { id: 'headphones', text: 'Headphones' },
      { id: 'neckbands', text: 'Neckbands' },
      { id: 'earphones', text: 'Wired Earphones' }
    ]
  },

  // Earbuds-specific questions based on actual database specifications
  earbuds: [
    {
      id: 'q1_usage_environment',
      question: 'Where will you mostly use these earbuds?',
      hasImportance: true,
      options: [
        {
          id: 'office_calls',
          text: '🏢 Office / Work Calls',
          spec: 'Clear mic + moderate ANC',
          description: 'For video meetings and professional calls in office environment',
          scoring: {
            mic_quality_weight: 1.8,
            anc_weight: 1.3,
            battery_weight: 1.2
          }
        },
        {
          id: 'travel_commute',
          text: '✈️ Travel / Daily Commute', 
          spec: 'Strong ANC + long battery',
          description: 'For buses, metro, flights - blocks traffic and crowd noise',
          scoring: {
            anc_weight: 2.0,
            battery_weight: 1.8,
            fast_charge_weight: 1.3
          }
        },
        {
          id: 'gym_outdoor',
          text: '💪 Gym / Running / Outdoor',
          spec: 'Sweat-proof + fast charging',
          description: 'For workouts and outdoor activities - durable and quick charge',
          scoring: {
            battery_weight: 1.4,
            fast_charge_weight: 1.6,
            anc_weight: 0.5
          }
        },
        {
          id: 'home_leisure',
          text: '🏠 Home Use / Casual Listening',
          spec: 'Balanced sound + comfort',
          description: 'For movies, music, and relaxed listening at home',
          scoring: {
            anc_weight: 0.7,
            battery_weight: 1.0,
            app_support_weight: 1.2
          }
        }
      ]
    },
    {
      id: 'q2_noise_cancellation',
      question: 'How much noise cancellation do you need?',
      hasImportance: true,
      helpText: 'We have 115 earbuds with ANC and 305 without ANC in our catalog',
      options: [
        {
          id: 'anc_strong',
          text: '🔇 Strong ANC (35-45dB)',
          spec: 'Blocks aircraft, train, traffic noise',
          description: 'For frequent travelers and noisy environments - almost complete silence',
          filters: { anc_required: true },
          scoring: { anc_weight: 2.5 }
        },
        {
          id: 'anc_moderate',
          text: '🔉 Moderate ANC (25-35dB)',
          spec: 'Blocks office chatter, AC hum',
          description: 'For offices and moderate noise - reduces distractions',
          filters: { anc_required: true },
          scoring: { anc_weight: 1.8 }
        },
        {
          id: 'anc_basic',
          text: '🔊 Basic/Passive Isolation',
          spec: 'Ear tip seal only, no electronics',
          description: 'Just physical seal from ear tips - no active cancellation',
          filters: { anc_required: false },
          scoring: { anc_weight: 0.5 }
        },
        {
          id: 'anc_not_needed',
          text: '👂 I want to hear surroundings',
          spec: 'Transparency mode preferred',
          description: 'For safety while walking/running - stay aware of environment',
          scoring: { anc_weight: 0.2 }
        }
      ]
    },
    {
      id: 'q3_battery_life',
      question: 'How long should the battery last?',
      hasImportance: true,
      helpText: 'Battery range in our catalog: 2h - 120h (with charging case)',
      options: [
        {
          id: 'battery_60plus',
          text: '🔋 60+ hours total',
          spec: '6-8h earbuds + 50+h case',
          description: 'For weekly travelers - charge once a week',
          filters: { min_battery: 60 },
          scoring: { battery_weight: 2.5 }
        },
        {
          id: 'battery_40_60',
          text: '🔋 40-60 hours total',
          spec: '5-7h earbuds + 35-50h case',
          description: 'For daily use - charge twice a week (Most popular range)',
          filters: { min_battery: 40 },
          scoring: { battery_weight: 2.0 }
        },
        {
          id: 'battery_20_40',
          text: '🔋 20-40 hours total',
          spec: '4-5h earbuds + 15-35h case',
          description: 'For moderate use - charge every 2-3 days',
          filters: { min_battery: 20 },
          scoring: { battery_weight: 1.5 }
        },
        {
          id: 'battery_under_20',
          text: '⚡ Under 20h (but fast charging)',
          spec: '3-4h earbuds + fast charge',
          description: 'Mini charging case - 10 min = 2h playback',
          filters: { min_battery: 0 },
          scoring: { battery_weight: 0.8, fast_charge_weight: 2.0 }
        }
      ]
    },
    {
      id: 'q4_call_quality',
      question: 'How important is call quality for you?',
      hasImportance: true,
      options: [
        {
          id: 'calls_critical',
          text: '📞 Critical - Daily Work Calls',
          spec: 'ENC/cVc 8.0 + quad mic array',
          description: '4-6 mics with AI noise reduction - crystal clear in wind/traffic',
          scoring: { mic_quality_weight: 2.5 }
        },
        {
          id: 'calls_important',
          text: '📱 Important - Regular Calls',
          spec: 'ENC + dual/triple mic',
          description: '2-3 mics with basic noise reduction - clear indoors',
          scoring: { mic_quality_weight: 1.8 }
        },
        {
          id: 'calls_occasional',
          text: '☎️ Occasional - Sometimes',
          spec: 'Basic mic, no special tech',
          description: 'Single mic - works for quiet environment calls',
          scoring: { mic_quality_weight: 1.0 }
        },
        {
          id: 'calls_not_needed',
          text: '🎵 Music Only - Rarely Call',
          spec: 'Mic not important',
          description: 'Primarily for music/videos - calls are rare',
          scoring: { mic_quality_weight: 0.3 }
        }
      ]
    },
    {
      id: 'q5_fast_charging',
      question: 'Do you need fast charging?',
      hasImportance: true,
      helpText: 'Only 25 products in our catalog have fast charging feature',
      options: [
        {
          id: 'fast_charge_must',
          text: '⚡ Must Have - I always forget to charge',
          spec: '10 min = 100-120 min playback',
          description: 'Quick 10 minute charge gives 2 hours of music',
          filters: { fast_charge_required: true },
          scoring: { fast_charge_weight: 2.5, battery_weight: 0.8 }
        },
        {
          id: 'fast_charge_nice',
          text: '⚡ Nice to Have - Convenient',
          spec: '15-20 min = 2-3h playback',
          description: 'Fast charging is a plus but not mandatory',
          scoring: { fast_charge_weight: 1.5 }
        },
        {
          id: 'fast_charge_not_needed',
          text: '🔌 Not Needed - I charge overnight',
          spec: 'Normal charging is fine',
          description: 'I plan my charging, speed doesn\'t matter',
          scoring: { fast_charge_weight: 0.3, battery_weight: 1.5 }
        }
      ]
    },
    {
      id: 'q6_budget',
      question: 'What is your budget?',
      hasImportance: true,
      helpText: 'Products distribution: Under ₹2k (327) | ₹2-5k (53) | ₹5-10k (17) | ₹10k+ (17)',
      options: [
        {
          id: 'budget_under_2k',
          text: '💵 Under ₹2,000',
          spec: 'Budget - 327 products',
          description: 'Best value for money - basic features with good quality',
          priceRange: { min: 0, max: 2000 },
          scoring: { price_weight: 2.0, value_weight: 1.8 }
        },
        {
          id: 'budget_2k_5k',
          text: '💰 ₹2,000 - ₹5,000',
          spec: 'Mid-range - 53 products',
          description: 'Sweet spot - good features, reliable brands, ANC available',
          priceRange: { min: 2000, max: 5000 },
          scoring: { price_weight: 1.5, value_weight: 1.3 }
        },
        {
          id: 'budget_5k_10k',
          text: '💎 ₹5,000 - ₹10,000',
          spec: 'Premium - 17 products',
          description: 'Superior audio, strong ANC, app support, premium build',
          priceRange: { min: 5000, max: 10000 },
          scoring: { price_weight: 0.8, brand_weight: 1.5 }
        },
        {
          id: 'budget_10k_plus',
          text: '👑 ₹10,000+',
          spec: 'Flagship - 17 products',
          description: 'Top-tier audio, best ANC, LDAC/aptX, multipoint connectivity',
          priceRange: { min: 10000, max: 999999 },
          scoring: { price_weight: 0.3, brand_weight: 2.0, quality_weight: 2.0 }
        }
      ]
    }
  ],

  // Headphones-specific questions
  headphones: [
    {
      id: 'q1_usage_environment',
      question: 'Where will you mostly use these headphones?',
      hasImportance: true,
      options: [
        {
          id: 'studio_production',
          text: '🎙️ Studio / Music Production',
          spec: 'Studio-grade drivers + wired',
          description: 'For professional audio work, mixing, mastering - zero latency',
          scoring: {
            audio_quality_weight: 2.5,
            wired_weight: 2.0,
            comfort_weight: 1.8
          }
        },
        {
          id: 'office_calls',
          text: '🏢 Office / Work Calls',
          spec: 'Clear mic + moderate ANC',
          description: 'For video meetings and professional calls in office environment',
          scoring: {
            mic_quality_weight: 1.8,
            anc_weight: 1.3,
            battery_weight: 1.2
          }
        },
        {
          id: 'travel_commute',
          text: '✈️ Travel / Daily Commute',
          spec: 'Strong ANC + long battery',
          description: 'For buses, metro, flights - blocks traffic and crowd noise',
          scoring: {
            anc_weight: 2.0,
            battery_weight: 1.8,
            comfort_weight: 1.5
          }
        },
        {
          id: 'gaming',
          text: '🎮 Gaming / Streaming',
          spec: 'Low latency + good mic',
          description: 'For gaming and streaming - minimal delay and clear voice chat',
          scoring: {
            latency_weight: 2.0,
            mic_quality_weight: 1.6,
            battery_weight: 1.4
          }
        },
        {
          id: 'home_leisure',
          text: '🏠 Home Use / Music Lover',
          spec: 'Balanced sound + comfort',
          description: 'For extended listening sessions, movies, music at home',
          scoring: {
            audio_quality_weight: 1.8,
            comfort_weight: 1.6,
            battery_weight: 1.2
          }
        }
      ]
    },
    {
      id: 'q2_connection_type',
      question: 'Do you prefer wired or wireless?',
      hasImportance: true,
      options: [
        {
          id: 'wired_only',
          text: '🔌 Wired Only',
          spec: '3.5mm / USB-C / Lightning',
          description: 'For audiophiles - zero latency, no charging needed',
          filters: { wireless_required: false },
          scoring: { audio_quality_weight: 2.0, latency_weight: 2.5 }
        },
        {
          id: 'wireless_only',
          text: '📡 Wireless Only (Bluetooth)',
          spec: 'Bluetooth 5.0+ / LDAC / aptX',
          description: 'For freedom of movement - no cable hassle',
          filters: { wireless_required: true },
          scoring: { battery_weight: 2.0, convenience_weight: 2.0 }
        },
        {
          id: 'hybrid_both',
          text: '🔄 Hybrid (Both)',
          spec: 'Bluetooth + 3.5mm backup',
          description: 'Best of both worlds - wireless with wired option when battery dies',
          scoring: { versatility_weight: 2.0, battery_weight: 1.5 }
        }
      ]
    },
    {
      id: 'q3_noise_cancellation',
      question: 'How much noise cancellation do you need?',
      hasImportance: true,
      options: [
        {
          id: 'anc_strong',
          text: '🔇 Strong ANC (35-45dB)',
          spec: 'Blocks aircraft, train, traffic noise',
          description: 'For frequent travelers and noisy environments - almost complete silence',
          filters: { anc_required: true },
          scoring: { anc_weight: 2.5 }
        },
        {
          id: 'anc_moderate',
          text: '🔉 Moderate ANC (25-35dB)',
          spec: 'Blocks office chatter, AC hum',
          description: 'For offices and moderate noise - reduces distractions',
          filters: { anc_required: true },
          scoring: { anc_weight: 1.8 }
        },
        {
          id: 'passive_isolation',
          text: '🔊 Passive Isolation',
          spec: 'Over-ear cushion seal only',
          description: 'Closed-back design blocks noise physically - no electronics',
          filters: { anc_required: false },
          scoring: { anc_weight: 0.5 }
        },
        {
          id: 'open_back',
          text: '🎵 Open Back / No Isolation',
          spec: 'Natural sound, hear surroundings',
          description: 'For home listening - natural soundstage, aware of environment',
          scoring: { anc_weight: 0.2, audio_quality_weight: 1.5 }
        }
      ]
    },
    {
      id: 'q4_battery_life',
      question: 'How long should the battery last? (for wireless)',
      hasImportance: true,
      options: [
        {
          id: 'battery_50plus',
          text: '🔋 50+ hours',
          spec: 'Ultra long battery life',
          description: 'For weekly travelers - charge once a week',
          filters: { min_battery: 50 },
          scoring: { battery_weight: 2.5 }
        },
        {
          id: 'battery_30_50',
          text: '🔋 30-50 hours',
          spec: 'Long battery life',
          description: 'For daily use - charge twice a week',
          filters: { min_battery: 30 },
          scoring: { battery_weight: 2.0 }
        },
        {
          id: 'battery_15_30',
          text: '🔋 15-30 hours',
          spec: 'Moderate battery life',
          description: 'For moderate use - charge every 2-3 days',
          filters: { min_battery: 15 },
          scoring: { battery_weight: 1.5 }
        },
        {
          id: 'battery_not_important',
          text: '⚡ Battery not important (wired/flexible)',
          spec: 'Wired or can charge frequently',
          description: 'I use wired mostly or don\'t mind charging often',
          scoring: { battery_weight: 0.5 }
        }
      ]
    },
    {
      id: 'q5_call_quality',
      question: 'How important is call quality for you?',
      hasImportance: true,
      options: [
        {
          id: 'calls_critical',
          text: '📞 Critical - Daily Work Calls',
          spec: 'ENC + boom mic / quad mic array',
          description: 'Professional quality - crystal clear in any environment',
          scoring: { mic_quality_weight: 2.5 }
        },
        {
          id: 'calls_important',
          text: '📱 Important - Regular Calls',
          spec: 'ENC + dual/triple mic',
          description: '2-3 mics with basic noise reduction - clear indoors',
          scoring: { mic_quality_weight: 1.8 }
        },
        {
          id: 'calls_occasional',
          text: '☎️ Occasional - Sometimes',
          spec: 'Basic mic, no special tech',
          description: 'Single mic - works for quiet environment calls',
          scoring: { mic_quality_weight: 1.0 }
        },
        {
          id: 'calls_not_needed',
          text: '🎵 Music Only - Rarely Call',
          spec: 'Mic not important',
          description: 'Primarily for music/videos - calls are rare',
          scoring: { mic_quality_weight: 0.3 }
        }
      ]
    },
    {
      id: 'q6_budget',
      question: 'What is your budget?',
      hasImportance: true,
      options: [
        {
          id: 'budget_under_2k',
          text: '💵 Under ₹2,000',
          spec: 'Budget range',
          description: 'Best value for money - basic features with good quality',
          priceRange: { min: 0, max: 2000 },
          scoring: { price_weight: 2.0, value_weight: 1.8 }
        },
        {
          id: 'budget_2k_5k',
          text: '💰 ₹2,000 - ₹5,000',
          spec: 'Mid-range',
          description: 'Sweet spot - good features, reliable brands',
          priceRange: { min: 2000, max: 5000 },
          scoring: { price_weight: 1.5, value_weight: 1.3 }
        },
        {
          id: 'budget_5k_10k',
          text: '💎 ₹5,000 - ₹10,000',
          spec: 'Premium range',
          description: 'Superior audio, strong ANC, premium build',
          priceRange: { min: 5000, max: 10000 },
          scoring: { price_weight: 0.8, brand_weight: 1.5 }
        },
        {
          id: 'budget_10k_plus',
          text: '👑 ₹10,000+',
          spec: 'Flagship range',
          description: 'Top-tier audio, best ANC, LDAC/aptX, premium materials',
          priceRange: { min: 10000, max: 999999 },
          scoring: { price_weight: 0.3, brand_weight: 2.0, quality_weight: 2.0 }
        }
      ]
    }
  ],

  // Neckbands-specific questions
  neckbands: [
    {
      id: 'q1_usage_environment',
      question: 'Where will you mostly use this neckband?',
      hasImportance: true,
      options: [
        {
          id: 'office_calls',
          text: '🏢 Office / Work Calls',
          spec: 'Clear mic + long battery',
          description: 'For video meetings and calls throughout the day',
          scoring: {
            mic_quality_weight: 1.8,
            battery_weight: 1.6,
            comfort_weight: 1.4
          }
        },
        {
          id: 'travel_commute',
          text: '✈️ Travel / Daily Commute',
          spec: 'ANC + long battery',
          description: 'For buses, metro, trains - blocks noise, lasts all day',
          scoring: {
            anc_weight: 1.8,
            battery_weight: 2.0,
            fast_charge_weight: 1.4
          }
        },
        {
          id: 'gym_outdoor',
          text: '💪 Gym / Running / Outdoor',
          spec: 'Sweat-proof + secure fit',
          description: 'For workouts - water resistant, stays in place while moving',
          scoring: {
            durability_weight: 1.8,
            battery_weight: 1.4,
            comfort_weight: 1.5
          }
        },
        {
          id: 'all_day_use',
          text: '⏰ All Day Use / Multi-purpose',
          spec: 'Ultra long battery + comfort',
          description: 'For continuous use - calls, music, videos all day',
          scoring: {
            battery_weight: 2.5,
            comfort_weight: 1.8,
            mic_quality_weight: 1.4
          }
        },
        {
          id: 'casual_music',
          text: '🎵 Casual Music / Entertainment',
          spec: 'Good audio + lightweight',
          description: 'For music, movies, casual listening',
          scoring: {
            audio_quality_weight: 1.6,
            comfort_weight: 1.4,
            battery_weight: 1.2
          }
        }
      ]
    },
    {
      id: 'q2_battery_life',
      question: 'How long should the battery last?',
      hasImportance: true,
      helpText: 'Neckbands typically offer 8-40 hours of playback',
      options: [
        {
          id: 'battery_30plus',
          text: '🔋 30+ hours',
          spec: 'Ultra long battery',
          description: 'For heavy users - charge once a week or less',
          filters: { min_battery: 30 },
          scoring: { battery_weight: 2.5 }
        },
        {
          id: 'battery_20_30',
          text: '🔋 20-30 hours',
          spec: 'Long battery life',
          description: 'For daily use - charge twice a week (Most popular)',
          filters: { min_battery: 20 },
          scoring: { battery_weight: 2.0 }
        },
        {
          id: 'battery_10_20',
          text: '🔋 10-20 hours',
          spec: 'Moderate battery',
          description: 'For moderate use - charge every 2-3 days',
          filters: { min_battery: 10 },
          scoring: { battery_weight: 1.5 }
        },
        {
          id: 'battery_under_10',
          text: '⚡ Under 10h (but fast charging)',
          spec: 'Lightweight with fast charge',
          description: 'Compact design - 10 min charge = 2-3h playback',
          filters: { min_battery: 0 },
          scoring: { battery_weight: 0.8, fast_charge_weight: 2.0 }
        }
      ]
    },
    {
      id: 'q3_noise_cancellation',
      question: 'Do you need Active Noise Cancellation (ANC)?',
      hasImportance: true,
      options: [
        {
          id: 'anc_must_have',
          text: '🔇 Must Have - Strong ANC',
          spec: 'ANC 25-35dB reduction',
          description: 'For noisy environments - blocks traffic, office noise effectively',
          filters: { anc_required: true },
          scoring: { anc_weight: 2.5 }
        },
        {
          id: 'anc_nice_to_have',
          text: '🔉 Nice to Have - Basic ANC',
          spec: 'Basic ANC or ENC',
          description: 'Some noise reduction is helpful but not critical',
          filters: { anc_required: true },
          scoring: { anc_weight: 1.5 }
        },
        {
          id: 'anc_not_needed',
          text: '🔊 Not Needed - Passive OK',
          spec: 'Ear tip seal only',
          description: 'Passive isolation is enough - saves battery and cost',
          filters: { anc_required: false },
          scoring: { anc_weight: 0.3, battery_weight: 1.3 }
        }
      ]
    },
    {
      id: 'q4_call_quality',
      question: 'How important is call quality for you?',
      hasImportance: true,
      options: [
        {
          id: 'calls_critical',
          text: '📞 Critical - Daily Work Calls',
          spec: 'ENC + quad mic array',
          description: 'Professional quality - 4 mics with AI noise reduction',
          scoring: { mic_quality_weight: 2.5 }
        },
        {
          id: 'calls_important',
          text: '📱 Important - Regular Calls',
          spec: 'ENC + dual mic',
          description: '2 mics with environmental noise cancellation',
          scoring: { mic_quality_weight: 1.8 }
        },
        {
          id: 'calls_occasional',
          text: '☎️ Occasional - Sometimes',
          spec: 'Basic mic acceptable',
          description: 'Standard mic quality - works for normal calls',
          scoring: { mic_quality_weight: 1.0 }
        },
        {
          id: 'calls_not_needed',
          text: '🎵 Music Only - Rarely Call',
          spec: 'Mic not important',
          description: 'Primarily for music - calls are minimal',
          scoring: { mic_quality_weight: 0.3 }
        }
      ]
    },
    {
      id: 'q5_fast_charging',
      question: 'Do you need fast charging?',
      hasImportance: true,
      options: [
        {
          id: 'fast_charge_must',
          text: '⚡ Must Have - Always on the go',
          spec: '10 min = 5-10h playback',
          description: 'Quick charge for all-day use - never run out',
          filters: { fast_charge_required: true },
          scoring: { fast_charge_weight: 2.5 }
        },
        {
          id: 'fast_charge_nice',
          text: '⚡ Nice to Have - Convenient',
          spec: '15-20 min = decent hours',
          description: 'Fast charging is helpful but not critical',
          scoring: { fast_charge_weight: 1.5 }
        },
        {
          id: 'fast_charge_not_needed',
          text: '🔌 Not Needed - I plan ahead',
          spec: 'Normal charging is fine',
          description: 'I charge overnight or plan my charging',
          scoring: { fast_charge_weight: 0.3, battery_weight: 1.5 }
        }
      ]
    },
    {
      id: 'q6_budget',
      question: 'What is your budget?',
      hasImportance: true,
      options: [
        {
          id: 'budget_under_1_5k',
          text: '💵 Under ₹1,500',
          spec: 'Budget range',
          description: 'Best value - basic features with good battery life',
          priceRange: { min: 0, max: 1500 },
          scoring: { price_weight: 2.0, value_weight: 1.8 }
        },
        {
          id: 'budget_1_5k_3k',
          text: '💰 ₹1,500 - ₹3,000',
          spec: 'Mid-range',
          description: 'Sweet spot - good features, reliable brands, some with ANC',
          priceRange: { min: 1500, max: 3000 },
          scoring: { price_weight: 1.5, value_weight: 1.3 }
        },
        {
          id: 'budget_3k_6k',
          text: '💎 ₹3,000 - ₹6,000',
          spec: 'Premium range',
          description: 'Superior audio, ANC, fast charging, premium brands',
          priceRange: { min: 3000, max: 6000 },
          scoring: { price_weight: 0.8, brand_weight: 1.5 }
        },
        {
          id: 'budget_6k_plus',
          text: '👑 ₹6,000+',
          spec: 'Flagship range',
          description: 'Top-tier - best ANC, audio quality, build, and features',
          priceRange: { min: 6000, max: 999999 },
          scoring: { price_weight: 0.3, brand_weight: 2.0, quality_weight: 2.0 }
        }
      ]
    }
  ],

  // Wired Earphones-specific questions
  earphones: [
    {
      id: 'q1_usage_environment',
      question: 'Where will you mostly use these earphones?',
      hasImportance: true,
      options: [
        {
          id: 'office_work',
          text: '🏢 Office / Work',
          spec: 'Clear audio + inline mic',
          description: 'For work calls and focused listening at desk',
          scoring: {
            mic_quality_weight: 1.6,
            audio_quality_weight: 1.4,
            comfort_weight: 1.3
          }
        },
        {
          id: 'commute_travel',
          text: '🚌 Daily Commute / Travel',
          spec: 'Durable cable + good isolation',
          description: 'For buses, metro - tangle-free cable, blocks ambient noise',
          scoring: {
            durability_weight: 1.8,
            passive_isolation_weight: 1.6,
            cable_quality_weight: 1.4
          }
        },
        {
          id: 'gym_sports',
          text: '💪 Gym / Running / Sports',
          spec: 'Sweat-proof + secure fit',
          description: 'For workouts - water resistant, stays in ears while moving',
          scoring: {
            durability_weight: 2.0,
            fit_weight: 1.8,
            cable_quality_weight: 1.4
          }
        },
        {
          id: 'gaming',
          text: '🎮 Gaming / Low Latency',
          spec: 'Zero latency + good mic',
          description: 'For gaming and streaming - wired means zero lag',
          scoring: {
            audio_quality_weight: 1.8,
            mic_quality_weight: 1.6,
            comfort_weight: 1.4
          }
        },
        {
          id: 'music_audiophile',
          text: '🎵 Music / Audiophile',
          spec: 'High-fidelity drivers',
          description: 'For serious listening - accurate sound reproduction',
          scoring: {
            audio_quality_weight: 2.5,
            driver_size_weight: 1.8,
            impedance_weight: 1.4
          }
        },
        {
          id: 'casual_everyday',
          text: '🏠 Casual / Everyday Use',
          spec: 'Comfortable + reliable',
          description: 'For general use - videos, music, calls at home',
          scoring: {
            comfort_weight: 1.6,
            audio_quality_weight: 1.3,
            value_weight: 1.4
          }
        }
      ]
    },
    {
      id: 'q2_connector_type',
      question: 'What connector do you need?',
      hasImportance: true,
      options: [
        {
          id: 'connector_3_5mm',
          text: '🔌 3.5mm Jack',
          spec: 'Universal compatibility',
          description: 'For laptops, older phones, tablets - most common',
          filters: { connector_type: '3.5mm' },
          scoring: { compatibility_weight: 2.0 }
        },
        {
          id: 'connector_usb_c',
          text: '🔌 USB Type-C',
          spec: 'Digital audio',
          description: 'For modern Android phones, laptops - better audio quality',
          filters: { connector_type: 'usb-c' },
          scoring: { audio_quality_weight: 1.5, compatibility_weight: 1.5 }
        },
        {
          id: 'connector_lightning',
          text: '🔌 Lightning (Apple)',
          spec: 'iPhone/iPad compatible',
          description: 'For iPhones and iPads - digital audio',
          filters: { connector_type: 'lightning' },
          scoring: { compatibility_weight: 2.0 }
        },
        {
          id: 'connector_flexible',
          text: '🔄 Any / Have Adapter',
          spec: 'Flexible on connector',
          description: 'I have adapters or multiple devices',
          scoring: { compatibility_weight: 1.0 }
        }
      ]
    },
    {
      id: 'q3_audio_priority',
      question: 'What is most important for audio?',
      hasImportance: true,
      options: [
        {
          id: 'audio_bass',
          text: '🎵 Strong Bass / EDM',
          spec: 'Enhanced low-frequency',
          description: 'For bass-heavy music - EDM, hip-hop, electronic',
          scoring: { bass_weight: 2.5, audio_quality_weight: 1.6 }
        },
        {
          id: 'audio_balanced',
          text: '🎼 Balanced / All Genres',
          spec: 'Flat frequency response',
          description: 'For all music types - accurate reproduction',
          scoring: { audio_quality_weight: 2.0, balance_weight: 2.0 }
        },
        {
          id: 'audio_clarity',
          text: '🗣️ Vocal Clarity / Podcasts',
          spec: 'Enhanced mid-range',
          description: 'For vocals, podcasts, audiobooks - clear speech',
          scoring: { clarity_weight: 2.5, audio_quality_weight: 1.5 }
        },
        {
          id: 'audio_treble',
          text: '🎻 Detailed Treble / Classical',
          spec: 'Enhanced high-frequency',
          description: 'For classical, acoustic - detailed highs',
          scoring: { treble_weight: 2.5, audio_quality_weight: 1.6 }
        }
      ]
    },
    {
      id: 'q4_call_quality',
      question: 'How important is call quality?',
      hasImportance: true,
      options: [
        {
          id: 'calls_critical',
          text: '📞 Critical - Daily Work Calls',
          spec: 'Inline remote + quality mic',
          description: 'Clear mic with inline controls for professional calls',
          scoring: { mic_quality_weight: 2.5, inline_controls_weight: 1.8 }
        },
        {
          id: 'calls_important',
          text: '📱 Important - Regular Calls',
          spec: 'Basic inline mic',
          description: 'Standard mic quality for regular phone calls',
          scoring: { mic_quality_weight: 1.5, inline_controls_weight: 1.2 }
        },
        {
          id: 'calls_not_needed',
          text: '🎵 Music Only - No Calls',
          spec: 'Mic not required',
          description: 'No mic needed - music listening only',
          scoring: { mic_quality_weight: 0.2, audio_quality_weight: 1.5 }
        }
      ]
    },
    {
      id: 'q5_cable_durability',
      question: 'How important is cable durability?',
      hasImportance: true,
      options: [
        {
          id: 'cable_critical',
          text: '💪 Very Important - Heavy Use',
          spec: 'Braided/Kevlar reinforced',
          description: 'For daily rough use - braided or kevlar reinforced cable',
          scoring: { durability_weight: 2.5, cable_quality_weight: 2.0 }
        },
        {
          id: 'cable_important',
          text: '🔧 Important - Regular Use',
          spec: 'Quality TPE/PVC cable',
          description: 'Good quality cable for everyday use - tangle resistant',
          scoring: { durability_weight: 1.8, cable_quality_weight: 1.5 }
        },
        {
          id: 'cable_standard',
          text: '📦 Standard - Careful Use',
          spec: 'Basic cable quality',
          description: 'Standard cable - I\'m careful with my earphones',
          scoring: { durability_weight: 1.0, value_weight: 1.3 }
        }
      ]
    },
    {
      id: 'q6_budget',
      question: 'What is your budget?',
      hasImportance: true,
      options: [
        {
          id: 'budget_under_500',
          text: '💵 Under ₹500',
          spec: 'Budget range',
          description: 'Best value - basic but functional with decent sound',
          priceRange: { min: 0, max: 500 },
          scoring: { price_weight: 2.0, value_weight: 1.8 }
        },
        {
          id: 'budget_500_1k',
          text: '💰 ₹500 - ₹1,000',
          spec: 'Mid-range',
          description: 'Sweet spot - good audio quality and durability',
          priceRange: { min: 500, max: 1000 },
          scoring: { price_weight: 1.5, value_weight: 1.3 }
        },
        {
          id: 'budget_1k_2k',
          text: '💎 ₹1,000 - ₹2,000',
          spec: 'Premium range',
          description: 'Superior audio, premium materials, branded',
          priceRange: { min: 1000, max: 2000 },
          scoring: { price_weight: 0.8, brand_weight: 1.5, audio_quality_weight: 1.6 }
        },
        {
          id: 'budget_2k_plus',
          text: '👑 ₹2,000+',
          spec: 'Audiophile range',
          description: 'Top-tier audio - high-end drivers, premium build',
          priceRange: { min: 2000, max: 999999 },
          scoring: { price_weight: 0.3, brand_weight: 2.0, quality_weight: 2.5 }
        }
      ]
    }
  ]
};

// Helper function to get questions for a specific category
function getQuestionsForCategory(category) {
  if (!category || category === 'all') {
    // Return earbuds by default (backward compatibility)
    return [diqQuestions.category, ...diqQuestions.earbuds];
  }

  const categoryQuestions = diqQuestions[category];
  if (!categoryQuestions) {
    throw new Error(`Invalid category: ${category}. Available categories: earbuds, headphones, neckbands, earphones`);
  }

  return [diqQuestions.category, ...categoryQuestions];
}

// Export default (earbuds for backward compatibility)
module.exports = [diqQuestions.category, ...diqQuestions.earbuds];

// Also export the full questions object and helper function
module.exports.diqQuestions = diqQuestions;
module.exports.getQuestionsForCategory = getQuestionsForCategory;
