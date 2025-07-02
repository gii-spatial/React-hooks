import { useEffect, useState } from "react";

export type GetDynamicViewportFN = (value: number | string) => string;

export interface UseDynamicViewportsResponse {
  /** True if 'dvh' is supported, otherwise false. */
  supportsDvh: boolean;
  /** True if 'dvw' is supported, otherwise false. */
  supportsDvw: boolean;

  /** Function that takes a number or string and returns a string with the appropriate height unit. */
  getDvHeight: GetDynamicViewportFN;
  /** function that takes a number or string and returns a string with the appropriate width unit. */
  getDvWidth: GetDynamicViewportFN;
}

/**
 * Custom hook to check for support of dynamic viewport units (dvh and dvw)
 * and provide functions to generate values with these units.
 *
 * @returns UseDynamicViewportsResponse
 */
export default function useDynamicViewports(): UseDynamicViewportsResponse {
  const [supportsDvh, setSupportsDvh] = useState(false);
  const [supportsDvw, setSupportsDvw] = useState(false);

  useEffect(() => {
    /**
     * 💡 For SSR Safety,
     * This check avoids calling `CSS.supports` during Server-Side Rendering
     */
    if (typeof window === "undefined" || !("CSS" in window)) return;

    setSupportsDvh(CSS.supports("height", "100dvh"));
    setSupportsDvw(CSS.supports("width", "100dvw"));
  }, []);

  const getDvHeight: GetDynamicViewportFN = (value) =>
    `${value}${supportsDvh ? "dvh" : "vh"}`;

  const getDvWidth: GetDynamicViewportFN = (value) =>
    `${value}${supportsDvw ? "dvw" : "vw"}`;

  return {
    supportsDvh,
    supportsDvw,
    getDvHeight,
    getDvWidth,
  };
}
