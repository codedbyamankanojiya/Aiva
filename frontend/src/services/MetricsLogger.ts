/**
 * MetricsLogger.ts — Session metrics persistence layer.
 * Buffers FrameSnapshot data in memory + IndexedDB during the session.
 * On stopTracking(), compiles InterviewSessionData, exports as JSON blob download,
 * and optionally POSTs to the backend API.
 */

import type {
  FrameSnapshot,
  InterviewSessionData,
  SessionSummary,
  FaceMetrics,
  MovementMetrics,
} from '../types/vision';

// ── IndexedDB constants ────────────────────────────────────────────────────

const DB_NAME = 'aiva_vision_metrics';
const DB_VERSION = 1;
const STORE_NAME = 'frames';

// ── Helper: open/init IndexedDB ────────────────────────────────────────────

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbPut(db: IDBDatabase, record: { key: string; data: FrameSnapshot }): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll(db: IDBDatabase): Promise<FrameSnapshot[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const records = req.result as Array<{ key: string; data: FrameSnapshot }>;
      resolve(records.map((r) => r.data));
    };
    req.onerror = () => reject(req.error);
  });
}

async function idbClear(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── Default metric values ──────────────────────────────────────────────────

export function defaultFaceMetrics(): FaceMetrics {
  return {
    faceDetected: false,
    eyeContact: false,
    irisCoords: [],
    meshCentroid: { x: 0.5, y: 0.5 },
    yawDeg: 0,
    pitchDeg: 0,
    focusScore: 0,
  };
}

export function defaultMovementMetrics(): MovementMetrics {
  return {
    bodyPresent: false,
    postureScore: 0,
    movementDelta: 0,
    excessiveMovement: false,
  };
}

// ── SessionMetricsService ──────────────────────────────────────────────────

export class SessionMetricsService {
  private sessionId: string;
  private startTimestamp: number;
  private frames: FrameSnapshot[] = [];
  private db: IDBDatabase | null = null;
  private frameCounter = 0;
  /** Persist to IndexedDB every N frames (reduces write pressure). */
  private readonly PERSIST_INTERVAL = 10;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.startTimestamp = Date.now();
    void this.initDB();
  }

  private async initDB(): Promise<void> {
    try {
      this.db = await openDB();
    } catch (err) {
      console.warn('[MetricsLogger] IndexedDB unavailable, using in-memory only:', err);
    }
  }

  /** Log a single frame snapshot. Call this each inference tick (~10 FPS). */
  logFrame(face: FaceMetrics, movement: MovementMetrics, latencyMs: number): void {
    const frame: FrameSnapshot = {
      t: Date.now() - this.startTimestamp,
      face,
      movement,
      latencyMs,
    };

    this.frames.push(frame);
    this.frameCounter++;

    // Async IndexedDB persist every PERSIST_INTERVAL frames
    if (this.db && this.frameCounter % this.PERSIST_INTERVAL === 0) {
      void idbPut(this.db, {
        key: `${this.sessionId}_${frame.t}`,
        data: frame,
      });
    }
  }

  /** Compile summary stats from all logged frames. */
  private computeSummary(): SessionSummary {
    if (this.frames.length === 0) {
      return {
        avgFocus: 0,
        eyeContactPercent: 0,
        totalMovementSpikes: 0,
        durationSeconds: 0,
      };
    }

    const totalFocus = this.frames.reduce((acc, f) => acc + f.face.focusScore, 0);
    const eyeContactFrames = this.frames.filter((f) => f.face.eyeContact).length;
    const movementSpikes = this.frames.filter((f) => f.movement.excessiveMovement).length;
    const durationMs = this.frames[this.frames.length - 1].t;

    return {
      avgFocus: Math.round(totalFocus / this.frames.length),
      eyeContactPercent: Math.round((eyeContactFrames / this.frames.length) * 100),
      totalMovementSpikes: movementSpikes,
      durationSeconds: Math.round(durationMs / 1000),
    };
  }

  /**
   * Compile InterviewSessionData, and POST to backend.
   * Clears IndexedDB store.
   */
  async stopTracking(options?: { backendUrl?: string }): Promise<InterviewSessionData> {
    // Merge any frames from IndexedDB that might have been written but not in memory
    let allFrames = this.frames;
    if (this.db) {
      try {
        const idbFrames = await idbGetAll(this.db);
        // Deduplicate by `t` field
        const seen = new Set(this.frames.map((f) => f.t));
        const extra = idbFrames.filter((f) => !seen.has(f.t));
        allFrames = [...this.frames, ...extra].sort((a, b) => a.t - b.t);
      } catch {
        // Use in-memory frames only
      }
    }

    this.frames = allFrames;

    const sessionData: InterviewSessionData = {
      sessionId: this.sessionId,
      timestamp: this.startTimestamp,
      frames: this.frames,
      summary: this.computeSummary(),
    };

    // ── Backend POST ─────────────────────────
    const backendUrl = options?.backendUrl || 'http://localhost:8000/api/vision-session';
    try {
      console.log(`[MetricsLogger] Sending session metrics to ${backendUrl}...`);
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      
      if (response.ok) {
        console.log('[MetricsLogger] Session metrics saved successfully to backend');
      } else {
        console.warn('[MetricsLogger] Failed to save session metrics:', await response.text());
      }
    } catch (err) {
      console.warn('[MetricsLogger] Backend POST failed:', err);
    }

    // ── Cleanup IndexedDB ─────────────────────────────
    if (this.db) {
      try {
        await idbClear(this.db);
        this.db.close();
      } catch {
        // Ignore
      }
    }

    this.frames = [];
    this.frameCounter = 0;

    return sessionData;
  }

  /** Snapshot of current session data (for mid-session reads). */
  getSnapshot(): InterviewSessionData {
    return {
      sessionId: this.sessionId,
      timestamp: this.startTimestamp,
      frames: [...this.frames],
      summary: this.computeSummary(),
    };
  }
}
