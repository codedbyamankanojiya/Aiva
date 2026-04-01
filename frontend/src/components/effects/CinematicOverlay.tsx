import { useRef, useEffect, useCallback, useState } from "react";

// ─── Configuration ──────────────────────────────────────────
const COLORS = {
  primary: "rgba(139, 92, 246,",      // purple
  secondary: "rgba(99, 102, 241,",     // indigo
  accent: "rgba(236, 72, 153,",        // pink
  cyan: "rgba(34, 211, 238,",          // cyan
  lavender: "rgba(196, 181, 253,",     // lavender
  white: "rgba(255, 255, 255,",        // white
};

// ─── HUD Ring (Rotating concentric radar rings) ─────────────
interface HUDRing {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  speed: number;
  dashPattern: number[];
  color: string;
  lineWidth: number;
  opacity: number;
  innerRings: number;
}

function createHUDRings(w: number, h: number): HUDRing[] {
  return [
    // Top-right large reticle
    {
      x: w * 0.82, y: h * 0.18, radius: 90,
      rotation: 0, speed: 0.008, dashPattern: [12, 8, 4, 8],
      color: COLORS.primary, lineWidth: 1.5, opacity: 0.25, innerRings: 3,
    },
    // Bottom-left medium reticle
    {
      x: w * 0.12, y: h * 0.75, radius: 65,
      rotation: Math.PI, speed: -0.012, dashPattern: [20, 10],
      color: COLORS.cyan, lineWidth: 1, opacity: 0.2, innerRings: 2,
    },
    // Center-right small reticle
    {
      x: w * 0.92, y: h * 0.55, radius: 45,
      rotation: 0, speed: 0.015, dashPattern: [6, 6],
      color: COLORS.secondary, lineWidth: 1, opacity: 0.18, innerRings: 2,
    },
    // Top-left small
    {
      x: w * 0.15, y: h * 0.25, radius: 35,
      rotation: Math.PI / 2, speed: -0.01, dashPattern: [8, 12],
      color: COLORS.accent, lineWidth: 1, opacity: 0.15, innerRings: 1,
    },
  ];
}

function drawHUDRing(ctx: CanvasRenderingContext2D, ring: HUDRing, time: number) {
  ctx.save();
  ctx.translate(ring.x, ring.y);
  ctx.rotate(ring.rotation + time * ring.speed);

  // Outer ring
  ctx.setLineDash(ring.dashPattern);
  ctx.strokeStyle = `${ring.color}${ring.opacity})`;
  ctx.lineWidth = ring.lineWidth;
  ctx.beginPath();
  ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner concentric rings
  for (let i = 1; i <= ring.innerRings; i++) {
    const r = ring.radius * (1 - i * 0.28);
    ctx.globalAlpha = ring.opacity * (1 - i * 0.25);
    ctx.strokeStyle = `${ring.color}${ring.opacity * (1 - i * 0.2)})`;
    ctx.lineWidth = ring.lineWidth * 0.7;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Crosshair lines
  ctx.setLineDash([]);
  ctx.strokeStyle = `${ring.color}${ring.opacity * 0.5})`;
  ctx.lineWidth = 0.5;
  const cr = ring.radius * 0.35;
  ctx.beginPath();
  ctx.moveTo(-cr, 0); ctx.lineTo(cr, 0);
  ctx.moveTo(0, -cr); ctx.lineTo(0, cr);
  ctx.stroke();

  // Scanning arc (partial arc that sweeps)
  const sweepAngle = Math.PI * 0.4;
  const sweepStart = time * ring.speed * 3;
  ctx.strokeStyle = `${ring.color}${ring.opacity * 1.5})`;
  ctx.lineWidth = ring.lineWidth * 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(0, 0, ring.radius * 0.7, sweepStart, sweepStart + sweepAngle);
  ctx.stroke();

  // Dot at center
  ctx.fillStyle = `${ring.color}${ring.opacity * 2})`;
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Data Waveform (flowing sine waves) ─────────────────────
interface Waveform {
  yBase: number;
  amplitude: number;
  frequency: number;
  speed: number;
  color: string;
  opacity: number;
  lineWidth: number;
  phase: number;
}

function createWaveforms(h: number): Waveform[] {
  return [
    {
      yBase: h * 0.2, amplitude: 25, frequency: 0.012,
      speed: 1.2, color: COLORS.accent, opacity: 0.15, lineWidth: 1.5, phase: 0,
    },
    {
      yBase: h * 0.22, amplitude: 18, frequency: 0.018,
      speed: 0.8, color: COLORS.primary, opacity: 0.12, lineWidth: 1, phase: Math.PI / 3,
    },
    {
      yBase: h * 0.78, amplitude: 30, frequency: 0.01,
      speed: -0.9, color: COLORS.cyan, opacity: 0.12, lineWidth: 1.2, phase: Math.PI,
    },
    {
      yBase: h * 0.8, amplitude: 15, frequency: 0.025,
      speed: 1.5, color: COLORS.lavender, opacity: 0.1, lineWidth: 0.8, phase: Math.PI / 2,
    },
  ];
}

function drawWaveform(ctx: CanvasRenderingContext2D, w: number, wf: Waveform, time: number) {
  ctx.beginPath();
  ctx.strokeStyle = `${wf.color}${wf.opacity})`;
  ctx.lineWidth = wf.lineWidth;

  for (let x = 0; x < w; x += 2) {
    const y = wf.yBase +
      Math.sin(x * wf.frequency + time * wf.speed + wf.phase) * wf.amplitude +
      Math.sin(x * wf.frequency * 2.3 + time * wf.speed * 0.7) * wf.amplitude * 0.3;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Glow effect
  ctx.strokeStyle = `${wf.color}${wf.opacity * 0.4})`;
  ctx.lineWidth = wf.lineWidth * 3;
  ctx.filter = "blur(4px)";
  ctx.stroke();
  ctx.filter = "none";
}

// ─── Holographic Bar Chart ──────────────────────────────────
interface BarChart {
  x: number;
  y: number;
  barCount: number;
  barWidth: number;
  maxHeight: number;
  gap: number;
  color: string;
  opacity: number;
}

function createBarCharts(w: number, h: number): BarChart[] {
  return [
    {
      x: w * 0.05, y: h * 0.55, barCount: 12, barWidth: 4,
      maxHeight: 50, gap: 3, color: COLORS.cyan, opacity: 0.2,
    },
    {
      x: w * 0.7, y: h * 0.85, barCount: 16, barWidth: 3,
      maxHeight: 35, gap: 2, color: COLORS.primary, opacity: 0.15,
    },
    {
      x: w * 0.88, y: h * 0.35, barCount: 8, barWidth: 3,
      maxHeight: 30, gap: 2, color: COLORS.accent, opacity: 0.12,
    },
  ];
}

function drawBarChart(ctx: CanvasRenderingContext2D, chart: BarChart, time: number) {
  ctx.save();

  for (let i = 0; i < chart.barCount; i++) {
    const barX = chart.x + i * (chart.barWidth + chart.gap);
    const heightPhase = Math.sin(time * 1.5 + i * 0.7) * 0.5 + 0.5;
    const barHeight = chart.maxHeight * (0.2 + heightPhase * 0.8);

    // Bar fill
    const gradient = ctx.createLinearGradient(barX, chart.y, barX, chart.y - barHeight);
    gradient.addColorStop(0, `${chart.color}${chart.opacity * 0.3})`);
    gradient.addColorStop(1, `${chart.color}${chart.opacity * 1.2})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, chart.y - barHeight, chart.barWidth, barHeight);

    // Bar top glow
    ctx.fillStyle = `${chart.color}${chart.opacity * 2})`;
    ctx.fillRect(barX, chart.y - barHeight, chart.barWidth, 1.5);
  }

  // Baseline
  ctx.strokeStyle = `${chart.color}${chart.opacity * 0.5})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(chart.x - 5, chart.y);
  ctx.lineTo(chart.x + chart.barCount * (chart.barWidth + chart.gap) + 5, chart.y);
  ctx.stroke();

  ctx.restore();
}

// ─── Hexagonal Grid ─────────────────────────────────────────
interface HexGrid {
  x: number;
  y: number;
  size: number;
  cols: number;
  rows: number;
  color: string;
  opacity: number;
}

function createHexGrids(w: number, h: number): HexGrid[] {
  return [
    { x: w * 0.02, y: h * 0.05, size: 18, cols: 5, rows: 4, color: COLORS.secondary, opacity: 0.08 },
    { x: w * 0.75, y: h * 0.65, size: 14, cols: 4, rows: 3, color: COLORS.lavender, opacity: 0.06 },
  ];
}

function drawHexGrid(ctx: CanvasRenderingContext2D, grid: HexGrid, time: number) {
  ctx.save();
  ctx.strokeStyle = `${grid.color}${grid.opacity})`;
  ctx.lineWidth = 0.8;

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : grid.size * 0.866;
      const cx = grid.x + col * grid.size * 1.732 + offsetX;
      const cy = grid.y + row * grid.size * 1.5;

      // Pulse individual hexagons
      const pulse = Math.sin(time * 0.8 + row * 1.2 + col * 0.7) * 0.5 + 0.5;
      ctx.globalAlpha = grid.opacity + pulse * 0.06;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = cx + grid.size * Math.cos(angle);
        const hy = cy + grid.size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();

      // Occasional fill for "active" hexagons
      if (pulse > 0.85) {
        ctx.fillStyle = `${grid.color}${grid.opacity * 1.5})`;
        ctx.fill();
      }
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ─── Circuit Traces (PCB-style lines with glowing nodes) ────
interface CircuitTrace {
  points: { x: number; y: number }[];
  color: string;
  opacity: number;
  nodeSize: number;
  pulseSpeed: number;
}

function createCircuitTraces(w: number, h: number): CircuitTrace[] {
  const traces: CircuitTrace[] = [];

  // Generate several circuit-like paths (right-angle turns)
  const configs = [
    { startX: w * 0.08, startY: h * 0.4, color: COLORS.primary, opacity: 0.12, steps: 8 },
    { startX: w * 0.6, startY: h * 0.1, color: COLORS.cyan, opacity: 0.1, steps: 6 },
    { startX: w * 0.4, startY: h * 0.88, color: COLORS.secondary, opacity: 0.08, steps: 7 },
    { startX: w * 0.85, startY: h * 0.45, color: COLORS.lavender, opacity: 0.1, steps: 5 },
  ];

  for (const cfg of configs) {
    const points: { x: number; y: number }[] = [{ x: cfg.startX, y: cfg.startY }];
    let cx = cfg.startX, cy = cfg.startY;
    let horizontal = Math.random() > 0.5;

    for (let i = 0; i < cfg.steps; i++) {
      const len = 30 + Math.random() * 60;
      if (horizontal) {
        cx += (Math.random() > 0.5 ? 1 : -1) * len;
      } else {
        cy += (Math.random() > 0.5 ? 1 : -1) * len;
      }
      // Clamp to canvas
      cx = Math.max(20, Math.min(w - 20, cx));
      cy = Math.max(20, Math.min(h - 20, cy));
      points.push({ x: cx, y: cy });
      horizontal = !horizontal;
    }

    traces.push({
      points,
      color: cfg.color,
      opacity: cfg.opacity,
      nodeSize: 3 + Math.random() * 2,
      pulseSpeed: 0.5 + Math.random() * 1.5,
    });
  }

  return traces;
}

function drawCircuitTrace(ctx: CanvasRenderingContext2D, trace: CircuitTrace, time: number) {
  ctx.save();
  ctx.strokeStyle = `${trace.color}${trace.opacity})`;
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  // Draw path
  ctx.beginPath();
  trace.points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();

  // Draw nodes at each vertex
  trace.points.forEach((p, i) => {
    const pulse = Math.sin(time * trace.pulseSpeed + i * 1.5) * 0.5 + 0.5;

    // Outer glow
    ctx.fillStyle = `${trace.color}${trace.opacity * pulse * 2})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, trace.nodeSize + pulse * 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright dot
    ctx.fillStyle = `${trace.color}${trace.opacity * 3})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Traveling pulse along the trace
  const totalLen = trace.points.length - 1;
  const progress = ((time * trace.pulseSpeed) % totalLen);
  const segIdx = Math.floor(progress);
  const segFrac = progress - segIdx;

  if (segIdx < totalLen) {
    const p1 = trace.points[segIdx];
    const p2 = trace.points[segIdx + 1];
    const px = p1.x + (p2.x - p1.x) * segFrac;
    const py = p1.y + (p2.y - p1.y) * segFrac;

    ctx.fillStyle = `${trace.color}${trace.opacity * 5})`;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    // Trailing glow
    ctx.fillStyle = `${trace.color}${trace.opacity * 2})`;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─── Scanning Lines (horizontal sweep) ──────────────────────
function drawScanLines(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Horizontal scanning line
  const scanY = ((time * 30) % (h + 60)) - 30;
  const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
  gradient.addColorStop(0, "rgba(139, 92, 246, 0)");
  gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.06)");
  gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, scanY - 20, w, 40);

  // Thin bright line
  ctx.strokeStyle = "rgba(139, 92, 246, 0.12)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, scanY);
  ctx.lineTo(w, scanY);
  ctx.stroke();
}

// ─── Floating Binary/Code Text ──────────────────────────────
interface FloatingText {
  x: number;
  y: number;
  speed: number;
  text: string;
  opacity: number;
  fontSize: number;
}

function createFloatingTexts(w: number, h: number): FloatingText[] {
  const texts: FloatingText[] = [];
  const codeSnippets = [
    "01001010", "0xAF3C", "10110", "sys.init()", ">>_", "0x7F",
    "SCAN..", "AI_OK", "λ→", "∑∆", "█▓░", "READY",
    "model.fit()", "GPU:ON", "⟨ψ|φ⟩", "∫dx", "nodes:28",
  ];

  for (let i = 0; i < 20; i++) {
    texts.push({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 0.15 + Math.random() * 0.4,
      text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
      opacity: 0.04 + Math.random() * 0.08,
      fontSize: 9 + Math.random() * 4,
    });
  }
  return texts;
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[], h: number, time: number) {
  ctx.save();
  ctx.font = "10px 'JetBrains Mono', 'Fira Code', monospace";

  texts.forEach((t) => {
    const y = (t.y + time * t.speed * 50) % (h + 40) - 20;
    const flicker = Math.sin(time * 3 + t.x * 0.01) * 0.5 + 0.5;
    ctx.globalAlpha = t.opacity * (0.5 + flicker * 0.5);
    ctx.font = `${t.fontSize}px 'JetBrains Mono', 'Fira Code', monospace`;

    ctx.fillStyle = `${COLORS.primary}${t.opacity * 3})`;
    ctx.fillText(t.text, t.x, y);
  });

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ─── Grid Overlay (subtle perspective grid) ─────────────────
function drawGridOverlay(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(139, 92, 246, 0.025)";
  ctx.lineWidth = 0.5;

  // Vertical lines
  const gridSpacing = 60;
  for (let x = 0; x < w; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y < h; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Corner Brackets (HUD targeting brackets) ───────────────
function drawCornerBrackets(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = `${COLORS.primary}0.08)`;
  ctx.lineWidth = 1.5;
  const s = 30; // bracket size
  const m = 25; // margin

  // Top-left
  ctx.beginPath();
  ctx.moveTo(m, m + s); ctx.lineTo(m, m); ctx.lineTo(m + s, m);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - m - s, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + s);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(m, h - m - s); ctx.lineTo(m, h - m); ctx.lineTo(m + s, h - m);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - m - s, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - s);
  ctx.stroke();

  ctx.restore();
}

// ─── Main Overlay Component ─────────────────────────────────
export function CinematicOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const stateRef = useRef<{
    hudRings: HUDRing[];
    waveforms: Waveform[];
    barCharts: BarChart[];
    hexGrids: HexGrid[];
    circuitTraces: CircuitTrace[];
    floatingTexts: FloatingText[];
  } | null>(null);

  const [isTouch] = useState(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window && !window.matchMedia("(pointer: fine)").matches;
  });

  const init = useCallback((w: number, h: number) => {
    stateRef.current = {
      hudRings: createHUDRings(w, h),
      waveforms: createWaveforms(h),
      barCharts: createBarCharts(w, h),
      hexGrids: createHexGrids(w, h),
      circuitTraces: createCircuitTraces(w, h),
      floatingTexts: createFloatingTexts(w, h),
    };
  }, []);

  useEffect(() => {
    if (isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      init(w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001; // Convert to seconds
      const state = stateRef.current;
      if (!state) return;

      ctx.clearRect(0, 0, w, h);

      // Layer 1: Subtle grid overlay
      drawGridOverlay(ctx, w, h);

      // Layer 2: Corner brackets
      drawCornerBrackets(ctx, w, h);

      // Layer 3: Hexagonal grids
      state.hexGrids.forEach((grid) => drawHexGrid(ctx, grid, time));

      // Layer 4: Circuit traces with traveling pulses
      state.circuitTraces.forEach((trace) => drawCircuitTrace(ctx, trace, time));

      // Layer 5: Bar charts
      state.barCharts.forEach((chart) => drawBarChart(ctx, chart, time));

      // Layer 6: Waveforms
      state.waveforms.forEach((wf) => drawWaveform(ctx, w, wf, time));

      // Layer 7: HUD rings
      state.hudRings.forEach((ring) => drawHUDRing(ctx, ring, time));

      // Layer 8: Scanning line
      drawScanLines(ctx, w, h, time);

      // Layer 9: Floating code/binary text
      drawFloatingTexts(ctx, state.floatingTexts, h, time);

      frameRef.current = requestAnimationFrame(animate);
    };

    // Fade in after a short delay
    canvas.style.opacity = "0";
    setTimeout(() => {
      if (canvas) canvas.style.opacity = "1";
    }, 200);

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [init, isTouch]);

  if (isTouch) return null;

  return (
    <canvas
      ref={canvasRef}
      className="cinematic-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        transition: "opacity 1.5s ease-in-out",
      }}
    />
  );
}
