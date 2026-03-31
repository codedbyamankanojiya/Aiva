import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorMode = "default" | "interactive" | "ai";

export function AivaCursor() {
  const [mode, setMode] = useState<CursorMode>("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const trailRef = useRef<{ x: number; y: number }[]>([]);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 800, damping: 35, mass: 0.3 });
  const springY = useSpring(cursorY, { stiffness: 800, damping: 35, mass: 0.3 });

  // Slower trailing dot
  const trailX = useSpring(cursorX, { stiffness: 200, damping: 25, mass: 0.8 });
  const trailY = useSpring(cursorY, { stiffness: 200, damping: 25, mass: 0.8 });

  const checkCursorTarget = useCallback((target: EventTarget | null) => {
    if (!target || !(target instanceof HTMLElement)) {
      setMode("default");
      return;
    }

    // Walk up the DOM tree to find data-cursor attribute
    let el: HTMLElement | null = target;
    while (el) {
      const cursorAttr = el.getAttribute("data-cursor");
      if (cursorAttr === "interactive") {
        setMode("interactive");
        return;
      }
      if (cursorAttr === "ai") {
        setMode("ai");
        return;
      }
      // Also detect buttons, links, and inputs
      const tag = el.tagName.toLowerCase();
      if (tag === "button" || tag === "a" || tag === "input" || tag === "select" || tag === "textarea") {
        setMode("interactive");
        return;
      }
      if (el.getAttribute("role") === "button") {
        setMode("interactive");
        return;
      }
      el = el.parentElement;
    }
    setMode("default");
  }, []);

  useEffect(() => {
    // Skip on touch devices
    if ("ontouchstart" in window && !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
      checkCursorTarget(e.target);

      // Update trail
      trailRef.current.push({ x: e.clientX, y: e.clientY });
      if (trailRef.current.length > 5) trailRef.current.shift();
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    // Add cursor:none to body
    document.body.style.cursor = "none";
    // Also ensure all interactive elements hide cursor
    const style = document.createElement("style");
    style.id = "aiva-cursor-hide";
    style.textContent = `*, *::before, *::after { cursor: none !important; }`;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      document.body.style.cursor = "";
      const styleEl = document.getElementById("aiva-cursor-hide");
      if (styleEl) styleEl.remove();
    };
  }, [cursorX, cursorY, checkCursorTarget]);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        {/* Default: glowing dot */}
        {mode === "default" && (
          <motion.div
            animate={{
              scale: isClicking ? 0.7 : 1,
              opacity: isClicking ? 0.9 : 0.7,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <div
              className="rounded-full"
              style={{
                width: 12,
                height: 12,
                background: "radial-gradient(circle, rgba(139,92,246,0.9) 0%, rgba(139,92,246,0.3) 60%, transparent 100%)",
                boxShadow: "0 0 12px rgba(139,92,246,0.5), 0 0 4px rgba(139,92,246,0.8)",
              }}
            />
          </motion.div>
        )}

        {/* Interactive: scanning brackets */}
        {mode === "interactive" && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: isClicking ? 0.85 : 1,
              opacity: 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              width: 32,
              height: 32,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Left bracket */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 2,
                width: 8,
                height: 28,
                borderLeft: "2px solid rgba(139,92,246,0.8)",
                borderTop: "2px solid rgba(139,92,246,0.8)",
                borderBottom: "2px solid rgba(139,92,246,0.8)",
                borderRadius: "3px 0 0 3px",
              }}
            />
            {/* Right bracket */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 2,
                width: 8,
                height: 28,
                borderRight: "2px solid rgba(139,92,246,0.8)",
                borderTop: "2px solid rgba(139,92,246,0.8)",
                borderBottom: "2px solid rgba(139,92,246,0.8)",
                borderRadius: "0 3px 3px 0",
              }}
            />
            {/* Center dot */}
            <div
              className="rounded-full"
              style={{
                width: 4,
                height: 4,
                background: "#8B5CF6",
                boxShadow: "0 0 8px rgba(139,92,246,0.8)",
              }}
            />
          </motion.div>
        )}

        {/* AI: pulsing scanner ring */}
        {mode === "ai" && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: isClicking ? 0.85 : [1, 1.15, 1],
              opacity: 1,
            }}
            transition={{
              scale: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "2px solid rgba(139,92,246,0.7)",
                boxShadow:
                  "0 0 16px rgba(139,92,246,0.4), inset 0 0 8px rgba(139,92,246,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.div
                className="rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: "#EC4899",
                  boxShadow: "0 0 10px rgba(236,72,153,0.6)",
                }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Trailing glow dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{
          x: trailX,
          y: trailY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: 24,
            height: 24,
            background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          }}
        />
      </motion.div>
    </>
  );
}
