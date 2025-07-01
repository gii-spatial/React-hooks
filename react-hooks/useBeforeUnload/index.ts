import { useEffect } from "react";

interface UseBeforeUnloadProps {
  /**
   * Whether the warning should be enabled.
   * @default true
   */
  enabled?: boolean;

  /** Callback function before the unload event. */
  callback?: () => void;
}

/**
 * Boiler plate hook to warn the user before unloading or navigating away from the page.
 * Useful for preventing accidental data loss on form pages or unsaved changes.
 *
 * @param props UseBeforeUnloadProps
 */
export function useBeforeUnload(props?: UseBeforeUnloadProps): void {
  const { enabled, callback } = props ?? { enabled: true };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!enabled) return;

      // When defined, invoke the callback first.
      if (typeof callback === "function") callback();

      /**
       * ⚠️ NOTE: -- Legacy support --
       * In some older browsers, setting `event.returnValue` is required to trigger the unload confirmation dialog.
       * Modern ones mostly ignore the message content and show a default warning.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/BeforeUnloadEvent/returnValue
       */
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled]);
}
