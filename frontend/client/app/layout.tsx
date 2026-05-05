import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CartModal from "@/components/CartModal";
import BagModal from "@/components/BagModal";
import CartNotification from "@/components/CartNotification";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "DropIQ Product Search",
  description: "Find the best products with AI-powered recommendations",
  icons: {
    icon: "/dropiq-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AuthProvider>
          <CartProvider>
            <PageTransition />
            <div className="main-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="container" style={{ flex: 1 }}>
                {children}
              </div>
            </div>
            <Footer />
            <CartModal />
            <BagModal />
            <CartNotification />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
