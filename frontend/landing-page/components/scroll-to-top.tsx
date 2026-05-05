"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Icon color based on theme
  const iconColor = theme === "dark" ? "#fff" : "#222";
  const bgColor = theme === "dark" ? "bg-zinc-800" : "bg-white";
  const borderColor = theme === "dark" ? "border-zinc-700" : "border-zinc-200";

  return (
    <button
      onClick={handleClick}
      aria-label="Scroll to top"
      className={`fixed left-6 bottom-6 z-50 p-3 rounded-full shadow-lg border transition-opacity duration-300 ${bgColor} ${borderColor} border-2 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
