import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "DropiQ - Find the best gadget value",
  description: "Compare prices and features across stores with a smart value score.",
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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-slate-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
