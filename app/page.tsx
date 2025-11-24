import { ShoppingBag, Ticket } from "lucide-react";
import MeltingSquare from "@/components/MeltingSquare";
import GlitchCountdown from "@/components/GlitchCountdown";
import AudioVisualizer from "@/components/AudioVisualizer";
import KonamiCode from "@/components/KonamiCode";
import Terminal from "@/components/Terminal";
import InfectionCounter from "@/components/InfectionCounter";
import FluxPlayer from "@/components/FluxPlayer";
import StemMixer from "@/components/StemMixer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 gap-16 md:gap-32 pb-32">
      <KonamiCode />
      <Terminal />
      <InfectionCounter />
      <FluxPlayer />

      {/* HERO SECTION */}
      <section className="w-full max-w-5xl flex flex-col items-center text-center gap-8">
        <MeltingSquare />

        <div className="space-y-2">
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter glitch-text" data-text="SYSTEM FLUX">
            SYSTEM FLUX
          </h1>
          <p className="font-mono text-sm md:text-base text-stark/60 tracking-widest uppercase">
            Julian Guggeis // Audio Experience
          </p>
        </div>

        <div className="mt-8">
          <p className="font-mono text-xs text-signal mb-2">NEXT_TRANSMISSION_IN:</p>
          <GlitchCountdown />
        </div>
      </section>

      {/* STREAMING SECTION */}
      <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        <div className="absolute -top-12 left-0 w-full">
          <AudioVisualizer />
        </div>

        <div className="p-6 border border-stark/10 hover:border-signal/50 transition-colors group bg-void-deep/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-1">LATEST RELEASE</h3>
            <p className="font-mono text-xs text-stark/50 mb-4">TRACK 03: TURN ME LOUDER</p>
          </div>
          <StemMixer />
        </div>
      </section>

      {/* MERCH & TOUR */}
      <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-signal">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-mono text-sm tracking-widest">MERCH_STORE</h2>
          </div>
          <div className="h-48 border border-stark/10 flex items-center justify-center bg-void-deep/30">
            <p className="font-mono text-xs text-stark/30">[NO DATA]</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-signal">
            <Ticket className="w-5 h-5" />
            <h2 className="font-mono text-sm tracking-widest">TOUR_DATES</h2>
          </div>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between border-b border-stark/10 pb-2">
              <span className="text-stark/60">2025.12.01</span>
              <span>BERLIN // KRAFTWERK</span>
            </div>
            <div className="flex justify-between border-b border-stark/10 pb-2">
              <span className="text-stark/60">2025.12.05</span>
              <span>LONDON // PRINTWORKS</span>
            </div>
            <div className="flex justify-between border-b border-stark/10 pb-2">
              <span className="text-stark/60">2025.12.12</span>
              <span>TOKYO // WOMB</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full max-w-5xl border-t border-stark/10 pt-8 flex justify-between items-end font-mono text-xs text-stark/30">
        <div>
          <p>FLUX_OS v1.0.0</p>
          <p>ALL RIGHTS RESERVED</p>
        </div>
        <div className="text-right">
          <p>EST. 2025</p>
          <p>SYSTEM STATUS: ONLINE</p>
        </div>
      </footer>
    </main>
  );
}
