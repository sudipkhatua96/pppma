import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let isHoveringClickable = false;
    let isVisible = false;

    // Track cursor positions
    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }

      // Position dot instantly to eliminate any frame latency
      dot.style.transform = `translate3d(${mouseX - 5}px, ${mouseY - 5}px, 0)`;

      // Check if hovering over interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = 
          target.closest("button") || 
          target.closest("a") || 
          target.closest("input") || 
          target.closest("select") || 
          target.closest("[role='button']") || 
          target.closest(".interactive-card-lift") || 
          window.getComputedStyle(target).cursor === "pointer";
        
        const dotInner = dot.firstElementChild as HTMLElement | null;
        const ringInner = ring.firstElementChild as HTMLElement | null;

        if (isClickable) {
          if (!isHoveringClickable) {
            isHoveringClickable = true;
            if (dotInner) dotInner.classList.add("scale-150");
            if (ringInner) {
              ringInner.classList.add("scale-150", "border-amber-400");
              ringInner.classList.remove("border-indigo-500");
            }
          }
        } else {
          if (isHoveringClickable) {
            isHoveringClickable = false;
            if (dotInner) dotInner.classList.remove("scale-150");
            if (ringInner) {
              ringInner.classList.remove("scale-150", "border-amber-400");
              ringInner.classList.add("border-indigo-500");
            }
          }
        }
      }
    };

    const handlePointerLeave = () => {
      isVisible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const handlePointerDown = () => {
      const dotInner = dot.firstElementChild as HTMLElement | null;
      const ringInner = ring.firstElementChild as HTMLElement | null;
      if (dotInner) dotInner.classList.add("scale-75");
      if (ringInner) ringInner.classList.add("scale-75");
    };

    const handlePointerUp = () => {
      const dotInner = dot.firstElementChild as HTMLElement | null;
      const ringInner = ring.firstElementChild as HTMLElement | null;
      if (dotInner) dotInner.classList.remove("scale-75");
      if (ringInner) ringInner.classList.remove("scale-75");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    let animationId: number;
    const updatePosition = () => {
      // Smooth interpolation for the outer ring
      const ease = 0.8; // ultra fast and responsive real-time tracking
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;

      // Update positions using GPU-accelerated translate3d on parent wrappers
      // We subtract exactly half the width and height (5px for dot, 16px for ring)
      // to lock the center of the visual elements on the hardware pointer tip
      dot.style.transform = `translate3d(${mouseX - 5}px, ${mouseY - 5}px, 0)`;
      ring.style.transform = `translate3d(${ringX - 16}px, ${ringY - 16}px, 0)`;

      animationId = requestAnimationFrame(updatePosition);
    };

    animationId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      {/* Golden active core dot wrapper */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 pointer-events-none z-[9999] opacity-0 select-none will-change-transform custom-cursor-element"
        style={{ pointerEvents: "none" }}
      >
        <div className="w-full h-full bg-amber-500 rounded-full transition-transform duration-150 ease-out dot-inner pointer-events-none" />
      </div>

      {/* Indigo/Saffron trailing ring wrapper */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] opacity-0 select-none will-change-transform custom-cursor-element"
        style={{ pointerEvents: "none" }}
      >
        <div className="w-full h-full border-2 border-indigo-500 rounded-full transition-all duration-200 ease-out ring-inner pointer-events-none" />
      </div>
    </>
  );
}
