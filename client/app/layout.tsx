import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CartModal from "@/components/CartModal";
import CartNotification from "@/components/CartNotification";
import Footer from "@/components/Footer";

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
            <div className="container" style={{ flex: 1 }}>
              {children}
            </div>
            <Footer />
            <CartModal />
            <CartNotification />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
