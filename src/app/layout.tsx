import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { PinLock } from "@/components/PinLock";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cake Manager",
  description: "Expenses, orders, and time tracking for the home bakery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 antialiased`}
      >
        <PinLock />
        <div className="mx-auto min-h-screen max-w-3xl pb-24">
          <header className="sticky top-0 z-30 bg-gray-50/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Cake Manager
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  Decoupled & Direct
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Mom Mode
              </span>
            </div>
          </header>
          <main className="px-4 py-2">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
