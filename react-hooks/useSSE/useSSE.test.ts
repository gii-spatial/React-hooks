import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useSSE from "./useSSE";

type Controller = {
  onMessage?: any;
  onResponse?: any;
  onRequestError?: any;
  onResponseError?: any;
};
let mockController: Controller;

const handlerController = {
  abort: vi.fn(),
};

vi.mock("event-source-plus", () => {
  return {
    EventSourcePlus: vi.fn().mockImplementation(() => {
      return {
        listen: vi.fn().mockImplementation((handlers) => {
          mockController = handlers;
          return handlerController as any;
        }),
      };
    }),
  };
});

describe("@/hooks/useSSE", () => {
  const url = "http://sample.com/sse-endpoint";

  beforeEach(() => {
    mockController = {};
    handlerController.abort = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Should initialize with null state", () => {
    const { result } = renderHook(() => useSSE(url));
    expect(result.current.pid).toBeNull();
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isConnected).toBe(false);
  });

  it("Should connect and should establish a connection and set pid", () => {
    const { result } = renderHook(() => useSSE(url));
    act(() => {
      result.current.connect();
    });

    expect(result.current.pid).toMatch(/^[a-z0-9]{7}$/);
    expect(result.current.isConnected).toBe(true);
  });

  it("Should Receive message via SSE", () => {
    type XPayload = { x_attr: string };
    const payload: XPayload = { x_attr: "attr-value" };
    const { result } = renderHook(() => useSSE<XPayload>(url));

    act(() => {
      result.current.connect();
      mockController.onMessage!({ data: JSON.stringify(payload) });
    });

    expect(result.current.data).toEqual(payload);
  });

  it("Should handle request error", () => {
    const error = new Error("Network request error");
    const { result } = renderHook(() => useSSE(url));

    act(() => {
      result.current.connect();
      mockController.onRequestError!({ request: {}, error });
    });

    expect(result.current.error).toBe(error.message);
  });

  it("Should handle response error with error value", () => {
    const error = new Error("Network response error");
    const { result } = renderHook(() => useSSE(url));

    act(() => {
      result.current.connect();
      mockController.onResponseError!({ request: {}, error });
    });

    expect(result.current.error).toBe(error.message);
  });

  it("Should handle response error with unknown value", () => {
    const { result } = renderHook(() => useSSE(url));

    act(() => {
      result.current.connect();
      mockController.onResponseError!({ request: {}, error: undefined });
    });

    expect(result.current.error).toBe("Unknown Error");
  });

  it("Should disconnect and should abort previous connection and reset state", () => {
    const { result } = renderHook(() => useSSE(url));

    act(() => {
      result.current.connect();
    });
    expect(handlerController.abort).not.toHaveBeenCalled();

    act(() => {
      result.current.disconnect();
    });
    expect(handlerController.abort).toHaveBeenCalled();
    expect(result.current.pid).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it("Disconnect function does nothing if sse is null", () => {
    const { result } = renderHook(() => useSSE<object>(url));

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.pid).toBeNull();
    expect(result.current.isConnected).toBe(false);
  });
});
