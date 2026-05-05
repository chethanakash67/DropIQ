"use client"

import type React from "react"

import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import SuccessPopup from "./success-popup"

const EmailSchema = z.object({
  email: z.string().email(),
})

type WaitlistFormProps = {
  id?: string
  className?: string
  size?: "sm" | "md" | "lg"
  buttonText?: string
  placeholder?: string
}

export default function WaitlistForm({
  id,
  className,
  size = "md",
  buttonText = "Join Early Access",
  placeholder = "Enter your email",
}: WaitlistFormProps) {
  
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const sizes = {
    sm: { input: "h-10 text-sm", btn: "h-10 px-4 text-sm" },
    md: { input: "h-12", btn: "h-12 px-6" },
    lg: { input: "h-14 text-lg", btn: "h-14 px-8 text-lg" },
  }

  async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setErrorMessage(null);
  const parsed = EmailSchema.safeParse({ email });
  if (!parsed.success) {
    // Corrected code: set the error message and display the toast
    setErrorMessage("Please enter a valid email.");
    toast({ title: "Please enter a valid email.", variant: "destructive" });
    return;
  }
  try {
    setLoading(true);
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      if (errorData.error === "Email already registered") {
        setErrorMessage("You're already on our waitlist!");
        toast({ title: "Email already registered", description: "You're already on our waitlist!", variant: "destructive" });
      } else if (errorData.error === "Failed to save email") {
        setErrorMessage("We could not save your email. Please try again.");
      } else if (errorData.error === "Invalid email") {
        // Corrected code: handle the "Invalid email" error from the backend
        setErrorMessage("Please enter a valid email.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
      return;
    }

    setShowSuccessPopup(true);
    setEmail("");
  } catch (err) {
    setErrorMessage("Something went wrong. Please try again.");
    toast({ title: "Something went wrong.", description: "Please try again.", variant: "destructive" });
  } finally {
    setLoading(false);
  }
}

  return (
    <>
      <form
        id={id}
        onSubmit={onSubmit}
        className={cn("w-full flex flex-col gap-3 sm:flex-row sm:items-center", className)}
      >
        <div className="w-full">
          <label className="sr-only" htmlFor={`${id ?? "waitlist"}-email`}>
            Email address
          </label>
          <Input
            id={`${id ?? "waitlist"}-email`}
            type="email"
            placeholder={placeholder}
            className={cn(
              "w-full rounded-xl border-gray-200 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus-visible:ring-cyan-500",
              sizes[size].input,
            )}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errorMessage && (
            <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "group relative overflow-hidden w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-500 via-lime-500 to-emerald-500 text-white shadow transition-all duration-300",
            "hover:scale-[1.02] hover:shadow-emerald-500/30 focus-visible:ring-2 focus-visible:ring-emerald-400",
            "dark:from-cyan-500 dark:via-sky-500 dark:to-cyan-500 dark:hover:shadow-[0_0_26px_rgba(34,211,238,0.6)] dark:focus-visible:ring-cyan-400",
            sizes[size].btn,
          )}
        >
          {/* subtle glossy sweep */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="absolute -inset-y-2 -left-1/3 w-1/3 rotate-12 bg-white/30 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-cyan-100/20 animate-[shine_2.2s_linear_infinite]" />
          </span>
          {loading ? "Joining..." : buttonText}
        </Button>
      </form>
      
      <SuccessPopup 
        isOpen={showSuccessPopup} 
        onClose={() => setShowSuccessPopup(false)} 
      />
      
      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-120%) rotate(12deg);
          }
          60% {
            transform: translateX(220%) rotate(12deg);
          }
          100% {
            transform: translateX(220%) rotate(12deg);
          }
        }
      `}</style>
    </>
  )
}