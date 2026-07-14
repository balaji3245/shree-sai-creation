import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "@/app/globals.css";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { FloatingWhatsApp } from "@/components/common/FloatingWhatsApp";
import { FloatingAssistant } from "@/components/common/FloatingAssistant";
import { LuxuryLoader } from "@/components/animation/LuxuryLoader";
import { PageTransition } from "@/components/animation/PageTransition";
import { ShowroomSpotlight } from "@/components/common/ShowroomSpotlight";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Shree Sai Creation | Premium Luxury Lighting & Chandeliers",
  description:
    "Explore Shree Sai Creation's curated collection of hand-blown crystal chandeliers, Spanish alabaster sconces, and sculptural brass pendants designed for high-end international residences.",
  openGraph: {
    title: "Shree Sai Creation | Premium Luxury Lighting",
    description: "Handcrafted luxury chandeliers and architectural lighting statement pieces.",
    url: "https://shreesaicreation.com",
    siteName: "Shree Sai Creation",
    images: [
      {
        url: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#0a0a0a] text-[#faf8f5] min-h-screen flex flex-col" suppressHydrationWarning>
        <CartProvider>
          {/* Intro loader that animates gold signature and disappears */}
          <LuxuryLoader />
          <ShowroomSpotlight />
          
          {/* Main layout Header */}
          <Header />
          
          {/* Content area with page routing transitions */}
          <PageTransition>
            <main className="flex-grow flex flex-col">{children}</main>
          </PageTransition>
          
          {/* Main layout Footer */}
          <Footer />

          {/* Floating Action Buttons */}
          <FloatingAssistant />
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}
