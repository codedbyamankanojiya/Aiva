import { useState, useEffect, useRef, useCallback } from "react";

interface UseTimerOptions {
  initialSeconds?: number;
  countDown?: boolean;
  autoStart?: boolean;
}

export function useTimer({
  initialSeconds = 0,
  countDown = false,
  autoStart = false,
}: UseTimerOptions = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setSeconds((prev) => {
      if (countDown && prev <= 0) return 0;
      return countDown ? prev - 1 : prev + 1;
    });
  }, [countDown]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = (newSeconds?: number) => {
    setSeconds(newSeconds ?? initialSeconds);
    setIsRunning(false);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return { seconds, minutes, secs, formatted, isRunning, start, pause, reset };
}
