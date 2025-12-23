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
  title: "The Sweet Connection",
  description: "Expenses, orders, and time tracking for the home bakery.",
  manifest: "/manifest.json", // You'll generate this later for PWA
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg", // Apple devices use this
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-900 antialiased`}
      >
        <PinLock />
        <div className="mx-auto min-h-screen max-w-3xl pb-24">
          {/* <header className="sticky top-0 z-30 bg-gray-50/90 backdrop-blur">
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
          </header> */}
          <header className="sticky top-0 z-30 bg-emerald-600 backdrop-blur py-3 flex items-center justify-center w-full mb-5">
            <div className="flex items-center justify-center">
              <h1 className="text-white text-2xl font-bold text-center flex items-center justify-center">
                The Sweet Connection
              </h1>
            </div>
          </header>
          <main className="px-4 py-2">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
