"use client";

import { useEffect, useRef } from "react";

interface NowStarfieldProps {
  className?: string;
  particleCount?: number;
  tint?: "light" | "dark";
  isCharging?: boolean;
  chargeProgress?: number;
}

interface StarParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
  phase: number;
  driftX: number;
  driftY: number;
  depth: number;
}

export default function NowStarfield({
  className = "",
  particleCount = 420,
  tint = "light",
  isCharging = false,
  chargeProgress = 0,
}: NowStarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    if (!host) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const particles: StarParticle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() < 0.1 ? 2.2 : Math.random() < 0.34 ? 1.45 : 0.9,
      alpha: 0.34 + Math.random() * 0.62,
      speed: 0.15 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.018,
      driftY: (Math.random() - 0.5) * 0.018,
      depth: 0.4 + Math.random() * 1.1,
    }));

    const resize = () => {
      width = Math.max(1, Math.floor(host.clientWidth));
      height = Math.max(1, Math.floor(host.clientHeight));
      canvas.width = Math.floor(width * window.devicePixelRatio);
      canvas.height = Math.floor(height * window.devicePixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
    };

    const handlePointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    const render = (time: number) => {
      context.clearRect(0, 0, width, height);

      pointer.x += (pointer.targetX - pointer.x) * 0.04;
      pointer.y += (pointer.targetY - pointer.y) * 0.04;

      for (const particle of particles) {
        const twinkle = 0.55 + Math.sin(time * 0.0012 * particle.speed + particle.phase) * 0.3;
        const baseX =
          (particle.x + particle.driftX * Math.sin(time * 0.00018 + particle.phase)) * width +
          pointer.x * particle.depth;
        const baseY =
          (particle.y + particle.driftY * Math.cos(time * 0.00016 + particle.phase)) * height +
          pointer.y * particle.depth;
        const focusStrength = isCharging ? (0.03 + chargeProgress * 0.18) * particle.depth : 0;
        const px = baseX + (width * 0.5 - baseX) * focusStrength;
        const py = baseY + (height * 0.5 - baseY) * focusStrength;

        const rgb = tint === "dark" ? "255,255,255" : "20,22,24";
        context.beginPath();
        context.fillStyle = `rgba(${rgb},${particle.alpha * twinkle * (tint === "dark" ? 1 : 0.62)})`;
        context.arc(px, py, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(() => resize());

    resize();
    resizeObserver.observe(host);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [chargeProgress, isCharging, particleCount, tint]);

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} aria-hidden="true" />;
}
