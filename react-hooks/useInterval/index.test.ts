import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInterval } from ".";

describe("@/react-hooks/useInterval", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("Calls callback at the specified interval", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000));

    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(4);
  });

  it("Does not start if enabled is set to false", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000, { enabled: false }));

    vi.advanceTimersByTime(3000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("Does not call immediately if autoStart is false", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000, { autoStart: false }));

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("Calls restart manually", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useInterval(callback, 1000, { autoStart: false })
    );

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      result.current.restart();
    });

    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("Should clean up interval on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInterval(callback, 1000));

    unmount();
    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("Does nothing if delay is null", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, null));

    vi.advanceTimersByTime(3000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("Does nothing if delay is undefined", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, undefined));

    vi.advanceTimersByTime(3000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("Does not start interval when delay is undefined and restart is called", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useInterval(callback, undefined, { autoStart: false })
    );

    act(() => {
      result.current.restart();
    });

    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledOnce();
  });

  it("Does not call callback or start interval when restart is called and enabled is false", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useInterval(callback, 1000, { enabled: false, autoStart: false })
    );

    act(() => {
      result.current.restart();
    });

    vi.advanceTimersByTime(3000);
    expect(callback).not.toHaveBeenCalled();
  });
});
