/**
 * FaceTrackingOverlay.tsx — Canvas landmark renderer.
 *
 * Renders on a canvas that is absolutely positioned over the video element.
 * Drawing layers:
 *   1. Blue — face mesh tessellation edges
 *   2. Green — iris rings + pupil dots
 *   3. Orange/Red — pose skeleton joints + bones
 */

import React, { useEffect, useRef } from 'react';
import type { FaceLandmarkResult, PoseLandmarkResult, NormalizedLandmark } from '../../types/vision';
import { FACEMESH_TESSELATION, FACEMESH_POINTS } from '../../constants/faceMeshIndices';

// ── Face mesh edge groups ─────────────────────────────────────────────────────

// Face oval (silhouette)
const OVAL: number[] = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10,
];

// Key face edges (eyes + nose + mouth outline)
const FACE_EDGES: [number, number][] = [
  // Left eye
  [33, 7], [7, 163], [163, 144], [144, 145], [145, 153],
  [153, 154], [154, 155], [155, 133], [33, 246], [246, 161],
  [161, 160], [160, 159], [159, 158], [158, 157], [157, 173], [173, 133],
  // Right eye
  [362, 382], [382, 381], [381, 380], [380, 374], [374, 373],
  [373, 390], [390, 249], [249, 263], [362, 398], [398, 384],
  [384, 385], [385, 386], [386, 387], [387, 388], [388, 466], [466, 263],
  // Nose bridge
  [168, 6], [6, 197], [197, 195], [195, 5], [5, 4], [4, 1], [1, 19], [19, 94],
  // Nose tip
  [64, 48], [48, 64], [98, 97], [97, 2], [2, 326], [326, 327],
  // Lips outline (outer)
  [61, 185], [185, 40], [40, 39], [39, 37], [37, 0], [0, 267],
  [267, 269], [269, 270], [270, 409], [409, 291], [291, 375],
  [375, 321], [321, 405], [405, 314], [314, 17], [17, 84], [84, 181],
  [181, 91], [91, 146], [146, 61],
  // Lips inner
  [78, 95], [95, 88], [88, 178], [178, 87], [87, 14], [14, 317],
  [317, 402], [402, 318], [318, 324], [324, 308], [78, 191],
  [191, 80], [80, 81], [81, 82], [82, 13], [13, 312], [312, 311],
  [311, 310], [310, 415], [415, 308],
];

// Pose connections
const POSE_EDGES: [number, number][] = [
  [11, 12], // shoulders
  [11, 23], [12, 24], // shoulder→hip
  [23, 24], // hips
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [23, 25], [25, 27], // left leg (partial)
  [24, 26], [26, 28], // right leg (partial)
];

const POSE_JOINT_INDICES = Array.from(new Set(POSE_EDGES.flat()));

// ─────────────────────────────────────────────────────────────────────────────

export interface FaceTrackingOverlayProps {
  faceResult: FaceLandmarkResult | null;
  poseResult: PoseLandmarkResult | null;
  width: number;
  height: number;
  className?: string;
}

function px(lm: NormalizedLandmark, w: number, h: number): [number, number] {
  return [lm.x * w, lm.y * h];
}

function drawFaceMesh(ctx: CanvasRenderingContext2D, lms: NormalizedLandmark[], w: number, h: number) {
  // Draw full tessellation mesh - vibrant green
  ctx.beginPath();
  ctx.strokeStyle = '#00FF00'; // Pure Green like in the image
  ctx.lineWidth = 0.5;
  FACEMESH_TESSELATION.forEach(([a, b]) => {
    const la = lms[a];
    const lb = lms[b];
    if (!la || !lb) return;
    const [ax, ay] = px(la, w, h);
    const [bx, by] = px(lb, w, h);
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
  });
  ctx.stroke();

  // Draw landmark points - small blue dots
  FACEMESH_POINTS.forEach((idx) => {
    const lm = lms[idx];
    if (!lm) return;
    const [x, y] = px(lm, w, h);
    
    // Draw small blue dot
    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#0066FF'; // Bright blue
    ctx.fill();
    
    // Optional: add a tiny white center for "sparkle"
    ctx.beginPath();
    ctx.arc(x, y, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  });
}

function drawIris(ctx: CanvasRenderingContext2D, lms: NormalizedLandmark[], w: number, h: number) {
  const draw = (group: NormalizedLandmark[]) => {
    const c = group[0];
    if (!c) return;
    const [cx, cy] = px(c, w, h);
    let r = 0;
    for (let i = 1; i < group.length; i++) {
      const [px2, py2] = px(group[i], w, h);
      r = Math.max(r, Math.hypot(px2 - cx, py2 - cy));
    }
    r = Math.max(r, 4);

    // Outer glow
    const grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r + 5);
    grad.addColorStop(0, 'rgba(139, 92, 246, 0)');
    grad.addColorStop(1, 'rgba(139, 92, 246, 0.3)');
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Iris circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pupil - Deep indigo
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(r * 0.3, 2), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(79, 70, 229, 0.9)';
    ctx.fill();
  };

  if (lms.length >= 478) {
    draw(lms.slice(468, 473));
    draw(lms.slice(473, 478));
  }
}

function drawPose(ctx: CanvasRenderingContext2D, lms: NormalizedLandmark[], w: number, h: number) {
  // Bones
  POSE_EDGES.forEach(([a, b]) => {
    const la = lms[a]; const lb = lms[b];
    if (!la || !lb) return;
    const vis = Math.min(la.visibility ?? 1, lb.visibility ?? 1);
    if (vis < 0.3) return;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,152,0,${0.4 + vis * 0.55})`;
    ctx.lineWidth = 2.5;
    ctx.moveTo(...px(la, w, h));
    ctx.lineTo(...px(lb, w, h));
    ctx.stroke();
  });

  // Joints
  POSE_JOINT_INDICES.forEach((idx) => {
    const lm = lms[idx];
    if (!lm || (lm.visibility ?? 1) < 0.3) return;
    const [x, y] = px(lm, w, h);
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,200,0,0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export const FaceTrackingOverlay = React.memo(function FaceTrackingOverlay({
  faceResult,
  poseResult,
  width,
  height,
}: FaceTrackingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (width <= 0 || height <= 0) return;

    canvas.width  = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    if (faceResult && faceResult.landmarks.length > 0) {
      const lms = faceResult.landmarks[0];
      drawFaceMesh(ctx, lms, width, height);
      drawIris(ctx, lms, width, height);
    }

    if (poseResult && poseResult.landmarks.length > 0) {
      drawPose(ctx, poseResult.landmarks[0], width, height);
    }
  }, [faceResult, poseResult, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
});
