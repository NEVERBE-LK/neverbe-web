"use client";

import React, { useEffect } from "react";
import { m, LazyMotion, domAnimation } from "framer-motion";

const SeasonalAnimations = ({
  season,
}: {
  season: "christmas" | "newYear" | null;
}) => {
  if (!season) return null;

  return (
    <LazyMotion features={domAnimation}>
      <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
        {season === "christmas" && <SnowAnimation />}
        {season === "newYear" && <FireworksAnimation />}
      </div>
    </LazyMotion>
  );
};

const SNOWFLAKES = Array.from({ length: 60 }).map((_, i) => {
  const r1 = ((i * 9301 + 49297) % 233280) / 233280;
  const r2 = ((i * 9377 + 49307) % 233280) / 233280;
  const r3 = ((i * 9439 + 49339) % 233280) / 233280;
  const r4 = ((i * 9511 + 49369) % 233280) / 233280;
  const r5 = ((i * 9587 + 49417) % 233280) / 233280;
  const r6 = ((i * 9661 + 49451) % 233280) / 233280;

  return {
    id: i,
    left: `${r1 * 100}%`,
    duration: r2 * 10 + 10, // Slower, more elegant fall (10-20s)
    delay: r3 * 10,
    size: r4 * 4 + 2, // 2px - 6px
    opacity: r5 * 0.4 + 0.2, // 0.2 - 0.6 opacity
    drift: r6 * 50 - 25, // Natural drift
  };
});

const SnowAnimation = () => {
  return (
    <>
      {SNOWFLAKES.map((flake) => (
        <m.div
          key={flake.id}
          className="absolute bg-white rounded-full blur-[0.5px]"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            top: -20,
          }}
          animate={{
            y: ["0vh", "100vh"],
            x: [0, flake.drift],
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
};

class FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  decay: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 4 + 2;
    this.vx = Math.cos(angle) * velocity;
    this.vy = Math.sin(angle) * velocity;
    this.alpha = 1;
    this.color = color;
    this.decay = Math.random() * 0.015 + 0.01;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.alpha -= this.decay;
  }
}

// Canvas-based Firework implementation
const FireworksAnimation = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: FireworkParticle[] = [];
    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // Premium Color Palette: Gold, Silver, White, Champagne
    const colors = [
      "var(--color-highlight)", // Gold
      "var(--color-secondary)", // Silver
      "var(--color-white)", // White
      "var(--color-highlight)", // Khaki/Champagne
      "var(--color-warning)", // Dark Goldenrod
    ];

    const createFirework = () => {
      // Random position in the top 40% of the screen
      const x = Math.random() * canvas.width;
      const y = Math.random() * (canvas.height * 0.4);
      const color = colors[Math.floor(Math.random() * colors.length)];

      for (let i = 0; i < 80; i++) {
        particles.push(new FireworkParticle(x, y, color));
      }
    };

    const animate = () => {
      // Use clearRect for transparency, no trails to keep it clean over product images
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Less frequent fireworks for less distraction (0.015 chance)
      if (Math.random() < 0.015) {
        createFirework();
      }

      particles.forEach((p, i) => {
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default SeasonalAnimations;
