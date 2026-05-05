"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle } from "lucide-react"

interface SuccessPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function SuccessPopup({ isOpen, onClose }: SuccessPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-emerald-600 dark:text-cyan-400">
            Welcome to the Waitlist! 🎉
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <CheckCircle className="h-16 w-16 text-emerald-500 dark:text-cyan-400" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              You've successfully entered the waitlist!
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Stay tuned, you'll get notified when the beta version of the product is launched.
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
          >
            Got it!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}