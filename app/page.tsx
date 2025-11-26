import MeltingSquare from "@/components/MeltingSquare";
import KonamiCode from "@/components/KonamiCode";
import Terminal from "@/components/Terminal";
import InfectionCounter from "@/components/InfectionCounter";
import FluxPlayer from "@/components/FluxPlayer";
import SingleLaunch from "@/components/SingleLaunch";
import Connect from "@/components/Connect";
import ScrollReveal from "@/components/ScrollReveal";
import DeploymentCountdown from "@/components/DeploymentCountdown";
import { ScrollIndicator } from "@/components/ScrollProgress";

export default function Home() {
  return (
    <>
      {/* Skip Navigation for keyboard users */}
      <a href="#main-content" className="skip-link">
        Zum Hauptinhalt springen
      </a>

      <main
        id="main-content"
        className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 gap-16 md:gap-32 pb-40 relative"
      >
      <KonamiCode />
      <Terminal />
      <InfectionCounter />
      <FluxPlayer />

      {/* HERO SECTION */}
      <section className="w-full max-w-5xl flex flex-col items-center text-center gap-8">
        <ScrollReveal animation="scale" delay={0.1}>
          <MeltingSquare />
        </ScrollReveal>

        <ScrollReveal animation="glitch" delay={0.3}>
          <div className="space-y-2">
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter glitch-text" data-text="SYSTEM FLUX">
              SYSTEM FLUX
            </h1>
            <p className="font-mono text-sm md:text-base text-stark/60 tracking-widest uppercase">
              Julian Guggeis // Audio Experience
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="slideUp" delay={0.4}>
          <div className="w-full max-w-md">
            <DeploymentCountdown />
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade" delay={0.7}>
          <ScrollIndicator className="mt-8" />
        </ScrollReveal>
      </section>

      {/* SINGLE LAUNCH SECTION */}
      <ScrollReveal animation="slideUp" delay={0.2}>
        <SingleLaunch />
      </ScrollReveal>

      {/* CONNECT SECTION */}
      <ScrollReveal animation="fade" delay={0.2} className="w-full max-w-3xl">
        <Connect />
      </ScrollReveal>

      <ScrollReveal animation="fade" delay={0.3} className="w-full max-w-5xl">
        <footer className="border-t border-stark/10 pt-8 font-mono text-xs text-stark/60">
          <div className="flex justify-between items-end">
            <div>
              <p>FLUX_OS v1.0.0</p>
              <p>ALL RIGHTS RESERVED</p>
            </div>
            <div className="text-right">
              <p>EST. 2025</p>
              <p>SYSTEM STATUS: ONLINE</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-stark/5">
            <a
              href="https://derguggeis.de/impressum"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-signal transition-colors"
            >
              IMPRESSUM
            </a>
            <span className="text-stark/30">{"//"}</span>
            <a
              href="https://derguggeis.de/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-signal transition-colors"
            >
              DATENSCHUTZ
            </a>
          </div>
        </footer>
      </ScrollReveal>
      </main>
    </>
  );
}
