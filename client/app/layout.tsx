import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CartModal from "@/components/CartModal";
import CartNotification from "@/components/CartNotification";

export const metadata: Metadata = {
  title: "DropIQ Product Search",
  description: "Find the best products with AI-powered recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <div className="container">
              {children}
            </div>
            <CartModal />
            <CartNotification />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
