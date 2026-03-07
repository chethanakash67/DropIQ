"use client"

import SectionReveal from "./section-reveal"
import { Card } from "@/components/ui/card"
import { Search, ContrastIcon as Compare, Sparkles, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import SmoothScrollLink from "./smooth-scroll-link"

function Step({ 
  icon: Icon, 
  title, 
  desc, 
  stepNumber, 
  isActive, 
  isLast 
}: { 
  icon: any; 
  title: string; 
  desc: string; 
  stepNumber: number;
  isActive: boolean;
  isLast: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative group">
      <Card 
        className={`p-6 rounded-2xl shadow-sm transition-all duration-700 ease-out transform ${
          isActive 
            ? 'shadow-xl border-emerald-300 dark:border-cyan-500 dark:shadow-[0_0_40px_rgba(34,211,238,0.2)]' 
            : 'hover:shadow-lg hover:border-emerald-200 dark:hover:border-cyan-400'
        } dark:bg-slate-900 dark:border-slate-800 border-2 ${
          isHovered ? 'border-emerald-300 dark:border-cyan-500' : 'border-transparent'
        } ${isActive ? 'animate-pulse' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Step number badge */}
        <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 dark:from-cyan-500 dark:to-sky-500 text-white text-sm font-bold flex items-center justify-center shadow-lg transition-all duration-500 ${
          isActive ? 'scale-125 animate-bounce' : 'scale-100'
        }`}>
          {stepNumber}
        </div>

        {/* Icon with enhanced styling */}
        <div className={`h-16 w-16 rounded-xl flex items-center justify-center transition-all duration-500 ${
          isActive 
            ? 'bg-gradient-to-br from-emerald-100 to-lime-100 dark:from-cyan-900/40 dark:to-sky-900/40 animate-pulse' 
            : 'bg-emerald-100 dark:bg-cyan-900/30'
        } ${isHovered ? 'shadow-lg' : ''}`}>
          <Icon className={`h-8 w-8 transition-all duration-500 ${
            isActive 
              ? 'text-emerald-700 dark:text-cyan-400 animate-bounce' 
              : 'text-emerald-700 dark:text-cyan-300'
          }`} aria-hidden="true" />
        </div>

        {/* Title with enhanced typography */}
        <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          {title}
        </h3>

        {/* Enhanced description */}
        <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">
          {desc}
        </p>

        {/* Success indicator for completed steps */}
        {isActive && (
          <div className="mt-4 flex items-center gap-2 text-emerald-600 dark:text-cyan-400 text-sm font-medium animate-in fade-in duration-500">
            <CheckCircle className="h-4 w-4 animate-pulse" />
            <span>Step {stepNumber} Complete</span>
          </div>
        )}

        {/* Hover effect overlay */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-lime-500/5 dark:from-cyan-500/5 dark:to-sky-500/5 opacity-0 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : ''
        }`} />
      </Card>
    </div>
  )
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)

  // Auto-advance through steps for demo effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3)
    }, 3000) // Increased to 4 seconds for better user experience

    return () => clearInterval(interval)
  }, [])

  const steps = [
    {
      icon: Search,
      title: "Search Your Gadget",
      desc: "Simply type the name of any phone, laptop, or accessory you're looking for. Our smart search understands product names and models to find exactly what you need."
    },
    {
      icon: Compare,
      title: "Compare Across Sites",
      desc: "We instantly scan hundreds of top online stores, local retailers, and exclusive deals to find every available option. See prices, features, and availability all in one place."
    },
    {
      icon: Sparkles,
      title: "Get the Best Value Score",
      desc: "Our proprietary algorithm calculates a smart Value Score that balances price, features, reviews, and reliability. The higher the score, the better the deal for your needs."
    }
  ]

  return (
    <SectionReveal id="how-it-works" as="section" className="container mx-auto px-4 py-16 scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {"3-Step: How DropIQ Works"}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {"From search to the smartest deal in seconds. Our intelligent system does the heavy lifting so you can focus on what matters most."}
        </p>
      </div>
      
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
        {steps.map((step, index) => (
          <Step
            key={index}
            icon={step.icon}
            title={step.title}
            desc={step.desc}
            stepNumber={index + 1}
            isActive={activeStep === index}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-12 flex justify-center">
        <div className="flex space-x-3">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-4 h-4 rounded-full transition-all duration-500 cursor-pointer ${
                activeStep === index
                  ? 'bg-emerald-500 dark:bg-cyan-400 scale-125 shadow-lg'
                  : 'bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 hover:scale-110'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Call to action */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {"Ready to find your next perfect deal?"}
        </p>
        <SmoothScrollLink href="#final-cta">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 dark:from-cyan-500 dark:to-sky-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 cursor-pointer">
            <span>Join the Waitlist</span>
          </div>
        </SmoothScrollLink>
      </div>
    </SectionReveal>
  )
}
