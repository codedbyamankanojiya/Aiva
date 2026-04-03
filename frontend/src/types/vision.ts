/**
 * vision.ts — Strict TypeScript data contracts for the interview vision system.
 * No `any` types used anywhere in this file.
 */

// ── Re-exported MediaPipe result shape aliases ─────────────────────────────

/** A single 3-D normalised landmark point from MediaPipe. */
export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
  presence?: number;
}

/** Iris / face-mesh landmark (478 points when iris tracking enabled). */
export interface FaceLandmarkResult {
  landmarks: NormalizedLandmark[][];          // one entry per detected face
  worldLandmarks: NormalizedLandmark[][];
  facialTransformationMatrixes?: Float32Array[];
}

/** Pose landmark result from PoseLandmarker. */
export interface PoseLandmarkResult {
  landmarks: NormalizedLandmark[][];
  worldLandmarks: NormalizedLandmark[][];
}

// ── Per-frame metric shapes ────────────────────────────────────────────────

export interface IrisCoord {
  x: number;
  y: number;
  z: number;
}

export interface MeshCentroid {
  x: number;
  y: number;
}

export interface FaceMetrics {
  /** Whether any face is present in the frame. */
  faceDetected: boolean;
  /** True when iris centroid is within ±10% of eye-socket centre. */
  eyeContact: boolean;
  /** All 478 face-mesh landmark points (iris + mesh). */
  irisCoords: IrisCoord[];
  /** Geometric centroid of the full face mesh. */
  meshCentroid: MeshCentroid;
  /** Yaw angle in degrees (+ = right, - = left). */
  yawDeg: number;
  /** Pitch angle in degrees (+ = up, - = down). */
  pitchDeg: number;
  /** 0–100 weighted focus score for this frame. */
  focusScore: number;
}

export interface MovementMetrics {
  /** Whether a body (torso) is present. */
  bodyPresent: boolean;
  /**
   * Deviation of shoulder midpoint from normalised centre (0 = perfect, 1 = edge).
   * Derived as Euclidean distance from (0.5, 0.5).
   */
  postureScore: number;
  /** Frame-to-frame Euclidean movement of shoulder centre. */
  movementDelta: number;
  /** True when shoulder centre shifts >15% of frame width within 500 ms. */
  excessiveMovement: boolean;
}

export interface FrameSnapshot {
  /** Milliseconds since session start. */
  t: number;
  face: FaceMetrics;
  movement: MovementMetrics;
  /** Raw inference latency for this frame (ms). */
  latencyMs: number;
}

// ── Session-level data ─────────────────────────────────────────────────────

export interface SessionSummary {
  /** Mean focus score across all frames (0–100). */
  avgFocus: number;
  /** Percentage of frames where eyeContact === true. */
  eyeContactPercent: number;
  /** Count of frames where excessiveMovement === true. */
  totalMovementSpikes: number;
  /** Total duration of the session in seconds. */
  durationSeconds: number;
}

export interface InterviewSessionData {
  sessionId: string;
  /** Unix timestamp (ms) at session start. */
  timestamp: number;
  frames: FrameSnapshot[];
  summary: SessionSummary;
}

// ── System status ──────────────────────────────────────────────────────────

export type SystemStatus = 'idle' | 'initializing' | 'ready' | 'failed';

// ── Web Worker message contracts ───────────────────────────────────────────

export interface VisionWorkerRequest {
  type: 'run';
  bitmap: ImageBitmap;
  timestamp: number;
}

export interface VisionWorkerResponse {
  type: 'result';
  faceResult: FaceLandmarkResult | null;
  poseResult: PoseLandmarkResult | null;
  timestamp: number;
  latencyMs: number;
}

export interface VisionWorkerError {
  type: 'error';
  message: string;
}

export interface VisionWorkerReady {
  type: 'ready';
}

export type VisionWorkerMessage =
  | VisionWorkerResponse
  | VisionWorkerError
  | VisionWorkerReady;

// ── Hook return type ───────────────────────────────────────────────────────

export interface VisionSystemState {
  faceMetrics: FaceMetrics;
  movementMetrics: MovementMetrics;
  systemStatus: SystemStatus;
  inferenceLatencyMs: number;
  /** Latest raw face landmark result (for canvas drawing). */
  faceResult: FaceLandmarkResult | null;
  /** Latest raw pose landmark result (for canvas drawing). */
  poseResult: PoseLandmarkResult | null;
}
