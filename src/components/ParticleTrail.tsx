import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  scaleSpeed: number;
  type: "petal" | "spark" | "mandala";
}

export default function ParticleTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Beautiful colors matching the theme: Lotus Pink, Saffron Gold, Kumkum Red, and Cream White
    const COLORS = [
      "rgba(236, 72, 153, 0.95)", // Lotus Pink
      "rgba(245, 166, 35, 0.95)",  // Saffron Gold
      "rgba(251, 146, 60, 0.95)",  // Soft Orange
      "rgba(220, 38, 38, 0.9)",    // Crimson Red
      "rgba(255, 215, 0, 0.95)"    // Bright Gold
    ];

    const createParticle = (x: number, y: number) => {
      // Create a small burst of particles on mouse moves
      const particleCount = Math.random() > 0.6 ? 2 : 1;

      for (let i = 0; i < particleCount; i++) {
        const typeRand = Math.random();
        let type: "petal" | "spark" | "mandala" = "petal";
        if (typeRand > 0.75) type = "spark";
        else if (typeRand > 0.92) type = "mandala";

        const size = Math.random() * 10 + (type === "mandala" ? 12 : 5);
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        // Speeds and vectors
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.2;
        const vx = Math.cos(angle) * speed;
        // Float upwards slightly like burning incense
        const vy = Math.sin(angle) * speed - 0.4; 

        particles.push({
          x,
          y,
          vx,
          vy,
          size,
          color,
          alpha: 1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
          scaleSpeed: Math.random() * 0.015 + 0.005,
          type
        });
      }

      // Limit particle array size
      if (particles.length > 120) {
        particles.splice(0, particles.length - 120);
      }
    };

    let lastX = 0;
    let lastY = 0;
    let didMove = false;

    // Global listener for pointer movements
    const handlePointerMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      didMove = true;
    };

    // Support touch interactions
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        didMove = true;
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Draw a single lotus petal shape
    const drawPetal = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.moveTo(0, -size);
      // Lotus petal curve
      c.quadraticCurveTo(size * 0.6, -size * 0.1, 0, size);
      c.quadraticCurveTo(-size * 0.6, -size * 0.1, 0, -size);
      c.closePath();
      c.fill();
    };

    // Draw a simple geometric rangoli spark
    const drawSpark = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      for (let j = 0; j < 4; j++) {
        c.rotate(Math.PI / 2);
        c.moveTo(0, 0);
        c.lineTo(0, -size);
        c.lineTo(size * 0.2, -size * 0.2);
      }
      c.closePath();
      c.stroke();
    };

    // Draw a small geometric mandala star (very cultural & festive)
    const drawMandala = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      for (let k = 0; k < 8; k++) {
        c.rotate(Math.PI / 4);
        c.moveTo(0, 0);
        c.quadraticCurveTo(size * 0.3, -size * 0.3, 0, -size);
      }
      c.closePath();
      c.fill();
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (didMove) {
        createParticle(lastX, lastY);
        didMove = false;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.scaleSpeed;
        p.size = Math.max(0, p.size - p.scaleSpeed * 4);

        if (p.alpha <= 0 || p.size <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;

        if (p.type === "petal") {
          drawPetal(ctx, p.size);
        } else if (p.type === "spark") {
          drawSpark(ctx, p.size);
        } else {
          drawMandala(ctx, p.size);
        }

        ctx.restore();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="lotus-particle-trail"
      className="fixed inset-0 pointer-events-none z-50 mix-blend-screen"
    />
  );
}
