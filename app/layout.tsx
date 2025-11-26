import type { Metadata, Viewport } from "next";
import { Oswald, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import NeuralBackground from "@/components/NeuralBackground";
import BootSequence from "@/components/BootSequence";
import CursorTrail from "@/components/CursorTrail";
import AIBadge from "@/components/AIBadge";
import ConsoleEasterEgg from "@/components/ConsoleEasterEgg";
import SelectionGlitch from "@/components/SelectionGlitch";
import ClickExplosion from "@/components/ClickExplosion";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import ScrollProgress from "@/components/ScrollProgress";
import ParallaxLayers from "@/components/ParallaxLayers";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FF4500",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://supshadow.github.io/CD-System-Flux"),
  title: "JULIAN GUGGEIS // SYSTEM FLUX",
  description: "Organic Cyberpunk Audio Experience - 25 Tracks, Interactive Visualizers, Agentic AI Theme",
  manifest: "/manifest.json",
  keywords: ["Julian Guggeis", "System Flux", "Music", "Electronic", "Cyberpunk", "Audio Experience", "Album"],
  authors: [{ name: "Julian Guggeis" }],
  creator: "Julian Guggeis",
  publisher: "Julian Guggeis",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SYSTEM FLUX",
    title: "SYSTEM FLUX - Julian Guggeis",
    description: "Organic Cyberpunk Audio Experience - 25 Tracks with Interactive Visualizers",
    images: [
      {
        url: "/artwork/Make me The Villain Artwork.jpg",
        width: 1200,
        height: 1200,
        alt: "SYSTEM FLUX Album Artwork",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SYSTEM FLUX - Julian Guggeis",
    description: "Organic Cyberpunk Audio Experience - 25 Tracks with Interactive Visualizers",
    images: ["/artwork/Make me The Villain Artwork.jpg"],
    creator: "@julgugg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SYSTEM FLUX",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${oswald.variable} ${robotoMono.variable} antialiased bg-void text-stark`}
      >
        <NeuralBackground />
        <ParallaxLayers />
        <CursorTrail />
        <ScrollProgress position="top" />
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        <BootSequence>
          <Providers>{children}</Providers>
        </BootSequence>
        <AIBadge />
        <ConsoleEasterEgg />
        <SelectionGlitch />
        <ClickExplosion />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
