import {
  type Mock,
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { renderHook } from "@testing-library/react";
import useDynamicViewports from ".";

describe("@/react-hooks/useDynamicViewports", () => {
  let originalCSSSupports: typeof CSS.supports;

  beforeEach(() => {
    // Store the original method
    originalCSSSupports = CSS.supports;

    // Mock only the supports method
    vi.spyOn(CSS, "supports").mockImplementation(
      (prop: string, value?: string) => {
        if (prop === "height" && value === "100dvh") return true;
        if (prop === "width" && value === "100dvw") return true;
        return false;
      }
    );
  });

  afterEach(() => {
    // Restore the original method
    CSS.supports = originalCSSSupports;
    vi.restoreAllMocks();
  });

  it("should detect support for dvh and dvw and return correct units", () => {
    const { result } = renderHook(() => useDynamicViewports());

    expect(result.current.supportsDvh).toBe(true);
    expect(result.current.supportsDvw).toBe(true);
    expect(result.current.getDvHeight(100)).toBe("100dvh");
    expect(result.current.getDvWidth("50")).toBe("50dvw");
  });

  it("should fall back to vh and vw if dvh/dvw are not supported", () => {
    // Override mock to simulate no support
    (CSS.supports as unknown as Mock).mockImplementation(() => false);

    const { result } = renderHook(() => useDynamicViewports());

    expect(result.current.supportsDvh).toBe(false);
    expect(result.current.supportsDvw).toBe(false);
    expect(result.current.getDvHeight(100)).toBe("100vh");
    expect(result.current.getDvWidth("50")).toBe("50vw");
  });
});
