import { useNavigate } from "react-router";
import { Button } from "@kreozalabs/ui";
import { ArrowRightIcon, ZapIcon, RefreshCcwIcon, CompassIcon } from "lucide-react";
import { Logo as KreozaLogo } from "@kreozalabs/icons";

import "../../landing.css";
import heroImg from "../../assets/hero.png";

export default function Home() {
  const navigate = useNavigate();

  const onLaunch = () => {
    navigate("/app");
  };

  return (
    <div className="landing-container">
      <nav className="container mx-auto flex h-20 items-center justify-between px-8 relative z-50">
        <div className="flex items-center gap-3">
          <KreozaLogo className="size-8" />
          <span className="text-2xl font-bold tracking-tight">Kei</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
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
          className="flex gap-4 mb-20 animate-fadeIn"
          style={{ animationDelay: "0.5s", animationFillMode: "both" }}
        >
          <Button
            size="lg"
            onClick={onLaunch}
            className="btn-primary-gradient px-10 h-14 rounded-2xl text-lg"
          >
            Enter
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="h-14 px-8 text-lg rounded-2xl group flex! flex-row! items-center! justify-center!"
          >
            <span className="flex flex-row items-center justify-center gap-2">
              Learn More{" "}
              <ArrowRightIcon className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>

        <img src={heroImg} alt="Kei Visual" className="hero-visual" />
      </section>

      <section id="values" className="container mx-auto py-24 px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Core Principles</h2>
          <p className="text-muted-foreground">The architecture of intentionality.</p>
        </div>
        <div className="values-grid">
          <div className="glass-card">
            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
              <ZapIcon className="size-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Effortless Agency</h3>
            <p className="text-muted-foreground leading-relaxed">
              Remove the friction between thought and action. Our tool makes it easy to do what you
              truly want to do.
            </p>
          </div>
          <div className="glass-card">
            <div className="size-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6 text-secondary">
              <RefreshCcwIcon className="size-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Graceful Adaptation</h3>
            <p className="text-muted-foreground leading-relaxed">
              Moving with the world, not against it. When states change, your plan evolves without
              guilt.
            </p>
          </div>
          <div className="glass-card">
            <div className="size-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6 text-accent">
              <CompassIcon className="size-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Directional Truth</h3>
            <p className="text-muted-foreground leading-relaxed">
              Success is staying true to your mission. We prioritize the "Why" behind every single
              task.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-border/50 text-center">
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-4">
          © 2026 KREOZA // KEI
        </p>
        <p className="mission-text">
          "You cannot change what happened, but you can influence what you are about to do."
        </p>
      </footer>
    </div>
  );
}
