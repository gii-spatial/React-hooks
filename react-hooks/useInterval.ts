import { useEffect, useRef, useCallback } from "react";

export interface UseIntervalOptions {
  /**
   * Whether the interval should run immediately when the hook mounts.
   * If `true`, the callback is called immediately and then repeated at the given interval.
   * @default true
   */
  autoStart?: boolean;
  /**
   * Whether the interval should be active. If `false`, the interval is inactive.
   * @default true
   */
  enabled?: boolean;
}

export interface UseIntervalResponse {
  /** Callback to allow interval restart */
  restart: () => void;
}
/**
 * A boilerplate hook that sets up a repeating interval with control over execution and cleanup.
 * Useful for basic polling or any periodic task in functional components.
 *
 * @param callback The function to be called at each interval.
 * @param delay Delay in milliseconds between executions. If `null` or `undefined`, the interval is not set.
 * @param options Optional configuration to control behavior.
 *
 * @returns A UseIntervalResponse object
 */
export function useInterval(
  callback: () => void,
  delay: number | null | undefined,
  options: UseIntervalOptions = {}
): UseIntervalResponse {
  const { autoStart = true, enabled = true } = options;
  const savedCallback = useRef<() => void>(undefined);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Core function to start the interval
  const startInterval = useCallback(() => {
    if (delay === null || delay === undefined) return;

    /**
     * IF there is an existing interval,
     * clear it first.
     */
    if (intervalIdRef.current) clearInterval(intervalIdRef.current);

    intervalIdRef.current = setInterval(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }, delay);
  }, [delay]);

  /**
   * ⚠️ NOTE: -- Callback behavior --
   * This will ensure that the latest version of the callback
   * is always used.
   */
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || delay === null || delay === undefined) return;
    if (autoStart && savedCallback.current) {
      savedCallback.current();
    }

    // Begin interval
    startInterval();

    /**
     * ⚠️ NOTE: -- Cleanup --
     * Ensure interval is always cleared
     * when specific dependencies chnaged.
     */
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [delay, autoStart, enabled, startInterval]);

  const restart = useCallback(() => {
    if (!enabled) return;
    if (savedCallback.current) savedCallback.current();

    startInterval();
  }, [startInterval, enabled]);

  return { restart };
}
