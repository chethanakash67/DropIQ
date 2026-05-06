"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CartModal from "@/components/CartModal";
import BagModal from "@/components/BagModal";
import CartNotification from "@/components/CartNotification";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import CursorTail from "@/components/landing/cursor-tail";
import ScrollToTop from "@/components/landing/scroll-to-top";
import { ThemeProvider } from "@/components/landing/theme-provider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>
        <CartProvider>
          {isLandingPage ? (
            <>
              {children}
              <CursorTail />
              <ScrollToTop />
            </>
          ) : (
            <>
              <PageTransition />
              <div className="main-content-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div className="container" style={{ flex: 1 }}>
                  {children}
                </div>
              </div>
              <Footer />
              <CartModal />
              <BagModal />
              <CartNotification />
            </>
          )}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
