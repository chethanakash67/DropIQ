"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
    "2xl": "h-16 w-16",
  };

  if (!mounted) {
    // Prevent hydration mismatch
    return (
      <div
        className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}
      />
    );
  }

  const logoSrc =
    theme === "dark"
      ? "/images/founders/slate_grey_logo.png"
      : "/images/founders/des-1-removebg-preview_cropped.png";

  return (
    <div
      className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      <img
        src={logoSrc}
        alt="DropiQ Logo"
        className="relative z-10 w-full h-full object-contain"
      />
    </div>
  );
}
