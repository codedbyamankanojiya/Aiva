/**
 * useVisionSystem.ts — Interview monitoring hook.
 *
 * Runs MediaPipe FaceLandmarker + PoseLandmarker DIRECTLY on the main thread.
 * The RAF loop keeps camera preview at 60 FPS; inference is throttled to ~10 FPS.
 * This is more reliable than a Web Worker because it avoids cross-origin WASM
 * loading issues, module URL resolution bugs, and ImageBitmap transfer overhead.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  FaceLandmarker,
  PoseLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';
import {
  SessionMetricsService,
  defaultFaceMetrics,
  defaultMovementMetrics,
} from '../services/MetricsLogger';
import type {
  FaceMetrics,
  MovementMetrics,
  SystemStatus,
  VisionSystemState,
  FaceLandmarkResult,
  PoseLandmarkResult,
  NormalizedLandmark,
} from '../types/vision';

// ── MediaPipe face-mesh landmark indices ──────────────────────────────────────

const LEFT_IRIS_CENTER  = 468;
const RIGHT_IRIS_CENTER = 473;
const LEFT_EYE_OUTER    = 33;
const LEFT_EYE_INNER    = 133;
const RIGHT_EYE_INNER   = 362;
const RIGHT_EYE_OUTER   = 263;
const POSE_LEFT_SHOULDER  = 11;
const POSE_RIGHT_SHOULDER = 12;
const POSE_LEFT_HIP  = 23;
const POSE_RIGHT_HIP = 24;

const INFERENCE_INTERVAL_MS    = 60;   // ~16 FPS inference (smoother overlay)
const EYE_CONTACT_TOLERANCE_X  = 0.18; // 18% of eye-socket half-width
const EYE_CONTACT_TOLERANCE_Y  = 0.25; // 25% of eye-socket height
const MOVEMENT_SPIKE_THRESHOLD = 0.12;
const MOVEMENT_WINDOW_MS       = 500;
const SMOOTHING_FACTOR         = 0.15; // For metric smoothing

// ── Metric derivation utilities ───────────────────────────────────────────────

function computeEyeContact(landmarks: NormalizedLandmark[]): boolean {
  // Need at least 478 points for iris tracking
  if (landmarks.length < 478) {
    if (landmarks.length < 468) return false;
    return true; 
  }

  const leftIris  = landmarks[LEFT_IRIS_CENTER];
  const leftOuter = landmarks[LEFT_EYE_OUTER];
  const leftInner = landmarks[LEFT_EYE_INNER];
  
  // Use vertical landmarks for better accuracy
  const leftTop    = landmarks[159];
  const leftBottom = landmarks[145];

  const rightIris  = landmarks[RIGHT_IRIS_CENTER];
  const rightOuter = landmarks[RIGHT_EYE_OUTER];
  const rightInner = landmarks[RIGHT_EYE_INNER];
  const rightTop    = landmarks[386];
  const rightBottom = landmarks[374];

  // Horizontal check
  const lHalfX   = Math.abs(leftOuter.x - leftInner.x) / 2;
  const lCenterX = (leftOuter.x + leftInner.x) / 2;
  const lOffX    = Math.abs(leftIris.x - lCenterX);

  const rHalfX   = Math.abs(rightOuter.x - rightInner.x) / 2;
  const rCenterX = (rightOuter.x + rightInner.x) / 2;
  const rOffX    = Math.abs(rightIris.x - rCenterX);

  // Vertical check
  const lHalfY   = Math.abs(leftTop.y - leftBottom.y) / 2;
  const lCenterY = (leftTop.y + leftBottom.y) / 2;
  const lOffY    = Math.abs(leftIris.y - lCenterY);

  const rHalfY   = Math.abs(rightTop.y - rightBottom.y) / 2;
  const rCenterY = (rightTop.y + rightBottom.y) / 2;
  const rOffY    = Math.abs(rightIris.y - rCenterY);

  const lOk = lHalfX > 0 && (lOffX / lHalfX <= EYE_CONTACT_TOLERANCE_X) && (lOffY / lHalfY <= EYE_CONTACT_TOLERANCE_Y);
  const rOk = rHalfX > 0 && (rOffX / rHalfX <= EYE_CONTACT_TOLERANCE_X) && (rOffY / rHalfY <= EYE_CONTACT_TOLERANCE_Y);
  
  return lOk && rOk;
}

function computeMeshCentroid(lms: NormalizedLandmark[]): { x: number; y: number } {
  if (lms.length === 0) return { x: 0.5, y: 0.5 };
  const sx = lms.reduce((s, l) => s + l.x, 0);
  const sy = lms.reduce((s, l) => s + l.y, 0);
  return { x: sx / lms.length, y: sy / lms.length };
}

function computeHeadPose(lms: NormalizedLandmark[]): { yawDeg: number; pitchDeg: number } {
  if (lms.length < 468) return { yawDeg: 0, pitchDeg: 0 };
  const noseTip    = lms[1];
  const leftTemple = lms[234];
  const rightTemple= lms[454];
  const chin       = lms[152];
  const noseBridge = lms[6];
  const tmid  = (leftTemple.x + rightTemple.x) / 2;
  const tw    = Math.abs(rightTemple.x - leftTemple.x);
  const yawDeg   = tw > 0 ? ((noseTip.x - tmid) / tw) * 90 : 0;
  const fh       = Math.abs(chin.y - noseBridge.y);
  const pitchDeg = fh > 0 ? ((noseTip.y - noseBridge.y) / fh - 0.5) * 90 : 0;
  return { yawDeg, pitchDeg };
}

function computeFocusScore(eye: boolean, yaw: number, pitch: number): number {
  // Eye contact is the strongest indicator
  const eyeWeight = eye ? 50 : 0;
  
  // Yaw (horizontal) penalty - more than 15 degrees is bad
  const yawPenalty = Math.max(0, Math.abs(yaw) - 15) * 2;
  
  // Pitch (vertical) penalty - more than 10 degrees is bad
  const pitchPenalty = Math.max(0, Math.abs(pitch) - 10) * 2.5;
  
  // Stability bonus/penalty can be added if we track movement here, 
  // but we use movementMetrics separately.
  
  const score = 100 - (eye ? 0 : 40) - yawPenalty - pitchPenalty;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function midpoint(lms: NormalizedLandmark[], a: number, b: number) {
  const la = lms[a]; const lb = lms[b];
  if (!la || !lb) return null;
  return { x: (la.x + lb.x) / 2, y: (la.y + lb.y) / 2 };
}

// ── Hook types ─────────────────────────────────────────────────────────────────

export interface UseVisionSystemOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  sessionId: string;
  enabled: boolean;
}

export interface UseVisionSystemReturn extends VisionSystemState {
  startTracking: () => void;
  stopTracking: () => Promise<void>;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useVisionSystem({
  videoRef,
  sessionId,
  enabled,
}: UseVisionSystemOptions): UseVisionSystemReturn {

  const [systemStatus, setSystemStatus] = useState<SystemStatus>('idle');
  const [faceMetrics,  setFaceMetrics]  = useState<FaceMetrics>(defaultFaceMetrics());
  const [movementMetrics, setMovementMetrics] = useState<MovementMetrics>(defaultMovementMetrics());
  const [inferenceLatencyMs, setInferenceLatencyMs] = useState(0);
  const [faceResult, setFaceResult] = useState<FaceLandmarkResult | null>(null);
  const [poseResult, setPoseResult] = useState<PoseLandmarkResult | null>(null);

  const faceLandmarkerRef  = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef  = useRef<PoseLandmarker | null>(null);
  const metricsRef         = useRef<SessionMetricsService | null>(null);
  const rafRef             = useRef<number>(0);
  const lastInferRef       = useRef<number>(0);
  const isRunningRef       = useRef(false);
  const isInferencingRef   = useRef(false);
  const prevShoulderRef    = useRef<{ x: number; y: number } | null>(null);
  const prevShoulderTsRef  = useRef<number>(0);
  const lastExcessiveRef   = useRef(false);

  // ── Initialize landmarkers (main thread) ─────────────────────────────────
  const initModels = useCallback(async () => {
    try {
      setSystemStatus('initializing');
      console.log('[Vision] Initializing MediaPipe models on main thread…');

      const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm';
      console.log('[Vision] Loading FilesetResolver from:', WASM_BASE);

      const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
      console.log('[Vision] FilesetResolver loaded ✓');

      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        },
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.3,
        minFacePresenceConfidence: 0.3,
        minTrackingConfidence: 0.3,
      });
      console.log('[Vision] FaceLandmarker ready ✓');

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.3,
        minPosePresenceConfidence: 0.3,
        minTrackingConfidence: 0.3,
      });
      console.log('[Vision] PoseLandmarker ready ✓');

      setSystemStatus('ready');
      console.log('[Vision] System READY — inference loop active');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Vision] INIT FAILED:', msg, err);
      setSystemStatus('failed');
    }
  }, []);

  // ── Main inference tick (runs inside RAF) ─────────────────────────────────
  const runInference = useCallback(() => {
    const video = videoRef.current;
    if (
      !video ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      video.videoWidth === 0 ||
      !faceLandmarkerRef.current ||
      !poseLandmarkerRef.current ||
      isInferencingRef.current
    ) return;

    const now = performance.now();
    if (now - lastInferRef.current < INFERENCE_INTERVAL_MS) return;
    lastInferRef.current = now;
    isInferencingRef.current = true;

    try {
      const t0 = performance.now();

      // Run face detection — detectForVideo accepts HTMLVideoElement directly
      const faceRaw = faceLandmarkerRef.current.detectForVideo(video, now);
      const poseRaw = poseLandmarkerRef.current.detectForVideo(video, now);

      const latencyMs = performance.now() - t0;
      setInferenceLatencyMs(latencyMs);

      // ── Adapt face result ───────────────────────────────────────────────
      const hasFace = faceRaw.faceLandmarks.length > 0;

      const adaptedFaceResult: FaceLandmarkResult | null = hasFace
        ? {
            landmarks: faceRaw.faceLandmarks.map((face) =>
              face.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility }))
            ),
            worldLandmarks: [],
          }
        : null;

      // ── Adapt pose result ───────────────────────────────────────────────
      const hasPose = poseRaw.landmarks.length > 0;

      const adaptedPoseResult: PoseLandmarkResult | null = hasPose
        ? {
            landmarks: poseRaw.landmarks.map((p) =>
              p.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility }))
            ),
            worldLandmarks: poseRaw.worldLandmarks.map((p) =>
              p.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility }))
            ),
          }
        : null;

      setFaceResult(adaptedFaceResult);
      setPoseResult(adaptedPoseResult);

      // ── Face metrics ────────────────────────────────────────────────────
      let face: FaceMetrics = defaultFaceMetrics();
      if (hasFace) {
        const landmarks = adaptedFaceResult!.landmarks[0];
        const eyeContact  = computeEyeContact(landmarks);
        const meshCentroid = computeMeshCentroid(landmarks);
        const { yawDeg, pitchDeg } = computeHeadPose(landmarks);
        const focusScore = computeFocusScore(eyeContact, yawDeg, pitchDeg);
        face = {
          faceDetected: true,
          eyeContact,
          irisCoords: landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z })),
          meshCentroid,
          yawDeg,
          pitchDeg,
          focusScore,
        };
      }

      // ── Movement metrics ────────────────────────────────────────────────
      let movement: MovementMetrics = defaultMovementMetrics();
      if (hasPose) {
        const poseLms = adaptedPoseResult!.landmarks[0];
        const sc = midpoint(poseLms, POSE_LEFT_SHOULDER, POSE_RIGHT_SHOULDER);
        if (sc) {
          const dist = Math.hypot(sc.x - 0.5, sc.y - 0.5);
          const postureScore = Math.max(0, 1 - dist * 2);
          let movementDelta = 0;
          const nowMs = performance.now();

          if (prevShoulderRef.current) {
            const dx = sc.x - prevShoulderRef.current.x;
            const dy = sc.y - prevShoulderRef.current.y;
            movementDelta = Math.hypot(dx, dy);
            const dt = nowMs - prevShoulderTsRef.current;
            if (dt <= MOVEMENT_WINDOW_MS && movementDelta > MOVEMENT_SPIKE_THRESHOLD) {
              lastExcessiveRef.current = true;
            } else if (dt > MOVEMENT_WINDOW_MS) {
              lastExcessiveRef.current = false;
            }
          }

          prevShoulderRef.current = sc;
          prevShoulderTsRef.current = nowMs;

          movement = {
            bodyPresent: true,
            postureScore,
            movementDelta,
            excessiveMovement: lastExcessiveRef.current,
          };
        }
      }

      setFaceMetrics(prev => ({
        ...face,
        focusScore: prev.faceDetected && face.faceDetected 
          ? prev.focusScore * (1 - SMOOTHING_FACTOR) + face.focusScore * SMOOTHING_FACTOR
          : face.focusScore
      }));
      setMovementMetrics(prev => ({
        ...movement,
        postureScore: prev.bodyPresent && movement.bodyPresent
          ? prev.postureScore * (1 - SMOOTHING_FACTOR) + movement.postureScore * SMOOTHING_FACTOR
          : movement.postureScore
      }));
      metricsRef.current?.logFrame(face, movement, latencyMs);

    } catch (err) {
      console.error('[Vision] Inference error:', err);
    } finally {
      isInferencingRef.current = false;
    }
  }, [videoRef]);

  // ── RAF loop (60 FPS camera preview, inference throttled) ─────────────────
  const rafLoop = useCallback(() => {
    if (!isRunningRef.current) return;
    if (systemStatus === 'ready') runInference();
    rafRef.current = requestAnimationFrame(rafLoop);
  }, [systemStatus, runInference]);

  // We need a stable ref to the latest rafLoop to avoid stale closures
  const rafLoopRef = useRef(rafLoop);
  rafLoopRef.current = rafLoop;

  const stableLoop = useCallback(() => {
    if (!isRunningRef.current) return;
    runInference();
    rafRef.current = requestAnimationFrame(stableLoop);
  }, [runInference]);

  // ── Public API ─────────────────────────────────────────────────────────────
  const startTracking = useCallback(() => {
    if (isRunningRef.current) return;
    metricsRef.current = new SessionMetricsService(sessionId);
    isRunningRef.current = true;
    rafRef.current = requestAnimationFrame(stableLoop);
    console.log('[Vision] RAF loop started');
  }, [sessionId, stableLoop]);

  const stopTracking = useCallback(async () => {
    isRunningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (metricsRef.current) {
      try {
        await metricsRef.current.stopTracking({
          backendUrl: 'http://localhost:8000/api/vision-session',
        });
      } catch (e) {
        console.warn('[Vision] Metrics export failed (non-fatal):', e);
      }
      metricsRef.current = null;
    }
    setSystemStatus('idle');
    setFaceMetrics(defaultFaceMetrics());
    setMovementMetrics(defaultMovementMetrics());
    setFaceResult(null);
    setPoseResult(null);
    prevShoulderRef.current = null;
    lastExcessiveRef.current = false;
    console.log('[Vision] Stopped');
  }, []);

  // ── Effect: init models once, then auto-start when enabled ────────────────
  useEffect(() => {
    // Initialize models immediately (they load in the background)
    void initModels();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (enabled && systemStatus === 'ready') {
      startTracking();
    } else if (!enabled) {
      void stopTracking();
    }
  }, [enabled, systemStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      faceLandmarkerRef.current?.close();
      poseLandmarkerRef.current?.close();
    };
  }, []);

  return {
    faceMetrics,
    movementMetrics,
    systemStatus,
    inferenceLatencyMs,
    faceResult,
    poseResult,
    startTracking,
    stopTracking,
  };
}
