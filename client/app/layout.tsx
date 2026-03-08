import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CartModal from "@/components/CartModal";
import CartNotification from "@/components/CartNotification";
import CursorTail from "@/components/CursorTail";

export const metadata: Metadata = {
  title: "DropIQ — Find Your Perfect Product",
  description: "AI-powered product discovery. Search millions of products or let D_IQ Intelligence match you perfectly.",
  icons: {
    icon: [
      { url: '/dropiq-logo.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <head>
        <link rel="icon" href="/dropiq-logo.png" type="image/png" />
      </head>
      <body className={GeistSans.className}>
        <CursorTail />
        <AuthProvider>
          <CartProvider>
            {children}
            <CartModal />
            <CartNotification />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
