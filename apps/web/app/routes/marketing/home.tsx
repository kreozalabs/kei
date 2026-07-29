import { useNavigate } from "react-router";
import { Button } from "@kreozalabs/kei-ui";
import { ArrowRightIcon, ZapIcon, RefreshCcwIcon, CompassIcon } from "lucide-react";
import { Logo as KreozaLogo } from "@kreozalabs/logos";

import "../../landing.css";

export default function Home() {
  const navigate = useNavigate();

  const onLaunch = () => {
    navigate("/app");
  };

  return (
    <div className="landing-container">
      <nav className="relative z-50 container mx-auto flex h-20 items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <KreozaLogo className="size-8" />
          <span className="text-2xl font-bold tracking-tight">Kei</span>
        </div>
        <div className="text-muted-foreground hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#mission" className="hover:text-primary transition-colors">
            Mission
          </a>
          <a href="#values" className="hover:text-primary transition-colors">
            Values
          </a>
          <Button onClick={onLaunch} variant="outline" className="rounded-full px-6">
            Launch
          </Button>
        </div>
      </nav>

      <section className="hero-section">
        <p className="hero-motto">Kei: The Productivity Agent</p>
        <h1 className="hero-title">
          Influence what you are <br />
          <span className="text-secondary italic">about to do.</span>
        </h1>
        <p className="hero-subtitle">
          Empowering intentional living by turning every moment into an opportunity for conscious
          choice. Experience the weightless agency of a tool that moves with you.
        </p>
        <div
          className="animate-fadeIn mb-20 flex gap-4"
          style={{ animationDelay: "0.5s", animationFillMode: "both" }}
        >
          <Button
            size="lg"
            onClick={onLaunch}
            className="btn-primary-gradient h-14 rounded-2xl px-10 text-lg"
          >
            Enter
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="group flex! h-14 flex-row! items-center! justify-center! rounded-2xl px-8 text-lg"
          >
            <span className="flex flex-row items-center justify-center gap-2">
              Learn More{" "}
              <ArrowRightIcon className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
        </div>
      </section>

      <section id="values" className="container mx-auto px-8 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">Core Principles</h2>
          <p className="text-muted-foreground">The architecture of intentionality.</p>
        </div>
        <div className="values-grid">
          <div className="glass-card">
            <div className="bg-primary/10 text-primary mb-6 flex size-12 items-center justify-center rounded-lg">
              <ZapIcon className="size-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Effortless Agency</h3>
            <p className="text-muted-foreground leading-relaxed">
              Remove the friction between thought and action. Our tool makes it easy to do what you
              truly want to do.
            </p>
          </div>
          <div className="glass-card">
            <div className="bg-secondary/10 text-secondary mb-6 flex size-12 items-center justify-center rounded-lg">
              <RefreshCcwIcon className="size-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Graceful Adaptation</h3>
            <p className="text-muted-foreground leading-relaxed">
              Moving with the world, not against it. When states change, your plan evolves without
              guilt.
            </p>
          </div>
          <div className="glass-card">
            <div className="bg-accent/10 text-accent mb-6 flex size-12 items-center justify-center rounded-lg">
              <CompassIcon className="size-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Directional Truth</h3>
            <p className="text-muted-foreground leading-relaxed">
              Success is staying true to your mission. We prioritize the "Why" behind every single
              task.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-border/50 border-t py-20 text-center">
        <p className="text-muted-foreground mb-4 font-mono text-sm tracking-widest uppercase">
          © 2026 KREOZA // KEI
        </p>
        <p className="mission-text">
          "You cannot change what happened, but you can influence what you are about to do."
        </p>
      </footer>
    </div>
  );
}
