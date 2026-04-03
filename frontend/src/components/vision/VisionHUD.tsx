/**
 * VisionHUD.tsx — Glass-morphism heads-up display for interview monitoring.
 *
 * Layers (top of video, pointer-events: none except debug button):
 *   - Top-left:  Face Presence LED + System Status badge
 *   - Top-right: Eye Contact badge
 *   - Bottom-left: Stability (movement) bar
 *   - Bottom-right: Focus Score ring
 *   - Debug panel: toggle shows latency, resolution, readyState
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FaceMetrics, MovementMetrics, SystemStatus } from '../../types/vision';

// ── Types ──────────────────────────────────────────────────────────────────

export interface VisionHUDProps {
  faceMetrics: FaceMetrics;
  movementMetrics: MovementMetrics;
  systemStatus: SystemStatus;
  inferenceLatencyMs: number;
  videoEl: HTMLVideoElement | null;
}

// ── Sub-components ─────────────────────────────────────────────────────────

/** Animated LED dot for face presence. */
const FaceLED = ({ on }: { on: boolean }) => (
  <motion.div
    animate={{ scale: on ? [1, 1.25, 1] : 1, opacity: on ? 1 : 0.4 }}
    transition={{ duration: 1, repeat: on ? Infinity : 0 }}
    className="relative flex items-center justify-center"
  >
    <div
      className={`w-3 h-3 rounded-full ${on ? 'bg-emerald-400' : 'bg-red-500'}`}
    />
    {on && (
      <div className="absolute w-3 h-3 rounded-full bg-emerald-400 opacity-40 scale-150 animate-ping" />
    )}
  </motion.div>
);

/** Arc circle for focus score (SVG-based). */
const FocusRing = ({ score }: { score: number }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  const color =
    score >= 80 ? '#10b981' : // Emerald 500
    score >= 50 ? '#f59e0b' : // Amber 500
    '#ef4444'; // Red 500

  return (
    <div className="relative flex items-center justify-center w-20 h-20 group">
      <svg className="absolute rotate-[-90deg]" width="80" height="80" viewBox="0 0 80 80">
        {/* Outer Glow */}
        <circle
          cx="40" cy="40" r={radius}
          fill="none" stroke={color} strokeWidth="6"
          className="opacity-10 blur-[4px]"
        />
        {/* Track */}
        <circle
          cx="40" cy="40" r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"
        />
        {/* Progress */}
        <motion.circle
          cx="40" cy="40" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <motion.span 
          key={score}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-lg font-black leading-none tracking-tighter"
        >
          {Math.round(score)}
        </motion.span>
        <span className="text-white/40 text-[9px] font-black uppercase leading-none mt-1 tracking-widest">focus</span>
      </div>
    </div>
  );
};

/** Horizontal stability bar (drops on excessive movement). */
const StabilityBar = ({ score, excessive }: { score: number; excessive: boolean }) => {
  const pct = Math.round(score * 100);
  const color = excessive ? '#ef4444' : pct >= 70 ? '#10b981' : '#f59e0b';

  return (
    <div className="flex flex-col gap-1.5 min-w-[110px]">
      <div className="flex justify-between items-center h-4">
        <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.15em]">Stability</span>
        <AnimatePresence>
          {excessive && (
            <motion.span
              key="alert"
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              className="text-red-400 text-[9px] font-black tracking-widest flex items-center gap-1"
            >
              <span className="animate-pulse">⚠</span> EXCESSIVE
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
        <motion.div
          className="h-full rounded-full relative"
          animate={{ width: `${pct}%`, backgroundColor: color }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ boxShadow: `0 0 10px ${color}60` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
};

/** Eye contact status badge. */
const EyeContactBadge = ({ eyeContact }: { eyeContact: boolean }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={eyeContact ? 'good' : 'away'}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
        backdrop-blur-sm border
        ${eyeContact
          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
          : 'bg-slate-800/40 border-white/10 text-white/50'
        }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${eyeContact ? 'bg-emerald-400' : 'bg-slate-400'}`} />
      {eyeContact ? 'Good Contact' : 'Gaze Away'}
    </motion.div>
  </AnimatePresence>
);

/** System status pill. */
const StatusPill = ({ status }: { status: SystemStatus }) => {
  const map: Record<SystemStatus, { label: string; color: string; icon: string }> = {
    idle:         { label: 'Vision Off',    color: 'bg-slate-600/40 text-slate-300', icon: '○' },
    initializing: { label: 'Loading AI…',   color: 'bg-amber-500/20 text-amber-300 border border-amber-400/30', icon: '◌' },
    ready:        { label: 'Vision Active', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30', icon: '●' },
    failed:       { label: 'Vision Failed', color: 'bg-red-500/20 text-red-300 border border-red-400/30', icon: '×' },
  };
  const { label, color, icon } = map[status];

  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${color}`}
    >
      <span className="text-xs">{icon}</span>
      {label}
    </motion.span>
  );
};

// ── Debug Panel ────────────────────────────────────────────────────────────

const DebugPanel = ({
  latencyMs,
  video,
  yawDeg,
  pitchDeg,
}: {
  latencyMs: number;
  video: HTMLVideoElement | null;
  yawDeg: number;
  pitchDeg: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    className="absolute bottom-16 left-3 z-50 bg-black/70 backdrop-blur-md rounded-lg p-3
      border border-white/10 font-mono text-[10px] text-green-400 space-y-0.5 min-w-[170px]"
  >
    <div className="text-white/40 font-bold uppercase tracking-widest mb-1">Debug Mode</div>
    <div>Latency: <span className="text-green-300">{latencyMs.toFixed(1)} ms</span></div>
    <div>ReadyState: <span className="text-green-300">{video?.readyState ?? '—'}</span></div>
    <div>Resolution: <span className="text-green-300">{video?.videoWidth ?? '?'}×{video?.videoHeight ?? '?'}</span></div>
    <div>Yaw: <span className="text-yellow-300">{yawDeg.toFixed(1)}°</span></div>
    <div>Pitch: <span className="text-yellow-300">{pitchDeg.toFixed(1)}°</span></div>
  </motion.div>
);

// ── Main HUD component ─────────────────────────────────────────────────────

export const VisionHUD: React.FC<VisionHUDProps> = ({
  faceMetrics,
  movementMetrics,
  systemStatus,
  inferenceLatencyMs,
  videoEl,
}) => {
  const [debugOpen, setDebugOpen] = useState(false);

  if (systemStatus === 'idle') return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 20 }}
    >
      {/* ── Top-left: Face LED + status ────────────────────────────────── */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-black/40 backdrop-blur-md border border-white/10"
        >
          <FaceLED on={faceMetrics.faceDetected} />
          <span className={`text-[11px] font-semibold ${faceMetrics.faceDetected ? 'text-white/90' : 'text-white/40'}`}>
            {faceMetrics.faceDetected ? 'Face Detected' : 'No Face'}
          </span>
        </div>
        <StatusPill status={systemStatus} />
      </div>

      {/* ── Top-right: Eye contact badge ─────────────────────────────── */}
      <div className="absolute top-3 right-3">
        {systemStatus === 'ready' && (
          <EyeContactBadge eyeContact={faceMetrics.eyeContact} />
        )}
      </div>

      {/* ── Bottom-right: Focus ring ──────────────────────────────────── */}
      <div className="absolute bottom-3 right-4">
        {systemStatus === 'ready' && (
          <div
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl
              bg-black/40 backdrop-blur-md border border-white/10"
          >
            <FocusRing score={faceMetrics.focusScore} />
          </div>
        )}
      </div>

      {/* ── Bottom-left: Stability bar ───────────────────────────────── */}
      <div className="absolute bottom-3 left-3">
        {systemStatus === 'ready' && (
          <div
            className="px-3 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10"
          >
            <StabilityBar
              score={movementMetrics.postureScore}
              excessive={movementMetrics.excessiveMovement}
            />
          </div>
        )}
      </div>

      {/* ── Debug toggle button (always pointer-events: auto) ─────────── */}
      <button
        onClick={() => setDebugOpen((p) => !p)}
        className="absolute bottom-3 left-1/2 -translate-x-1/2
          text-[9px] text-white/20 hover:text-white/60 transition-colors
          pointer-events-auto px-2 py-1 rounded font-mono"
        style={{ pointerEvents: 'auto' }}
        aria-label="Toggle debug mode"
      >
        {debugOpen ? '▲ hide debug' : '● debug'}
      </button>

      {/* ── Debug panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {debugOpen && (
          <DebugPanel
            latencyMs={inferenceLatencyMs}
            video={videoEl}
            yawDeg={faceMetrics.yawDeg}
            pitchDeg={faceMetrics.pitchDeg}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
