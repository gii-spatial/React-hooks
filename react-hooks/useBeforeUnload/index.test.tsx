import { describe, it, vi, beforeEach, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBeforeUnload } from ".";

describe("@react-hooks/useBeforeUnload", () => {
  const addEventListenerSpy = vi.spyOn(window, "addEventListener");
  const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

  const dispatchBeforeUnload = () => {
    const event = new Event("beforeunload", { cancelable: true });
    Object.defineProperty(event, "returnValue", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: undefined,
    });
    window.dispatchEvent(event);
    return event;
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Should add and remove the event listener", () => {
    const { unmount } = renderHook(() => useBeforeUnload());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function)
    );
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function)
    );
  });

  it("Should trigger the unload handler when enabled", () => {
    const callback = vi.fn();
    renderHook(() => useBeforeUnload({ enabled: true, callback }));

    const event = dispatchBeforeUnload();
    expect(callback).toHaveBeenCalled();
    expect(event.returnValue).toBe("");
  });

  it("Does not trigger handler when disabled", () => {
    const callback = vi.fn();
    renderHook(() => useBeforeUnload({ enabled: false, callback }));

    const event = dispatchBeforeUnload();
    expect(callback).not.toHaveBeenCalled();
    expect(event.returnValue).toBe(undefined);
  });

  it("Should work with no props", () => {
    renderHook(() => useBeforeUnload());

    const event = dispatchBeforeUnload();
    expect(event.returnValue).toBe("");
  });
});
