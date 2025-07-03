import { useEffect, useState, useCallback } from "react";
import { type EventSourceController, EventSourcePlus } from "event-source-plus";

export interface ServerSentEvent<T> {
  /** Current SSE process ID */
  pid: string | null;
  /** Data received from the SSE. */
  data: T | null;
  /** Error message */
  error: string | null;
  /** Function to start the SSE Connection. */
  connect: () => void;
  /** Function to end the SSE Connection. */
  disconnect: () => void;
  /** Identifier if the SSE is connected. */
  isConnected: boolean;
}

interface UseSSEReturns<T> extends ServerSentEvent<T> {}

// SSE Event messages
const SSE_MESSAGE = {
  connected: "Connection established",
  disconnected: "Disconnected",
  received: "Mesage received",
  error: {
    general: "An error occurred while establishing connection.",
    request: "Request error",
    response: "Response error",
  },
};

// Helper function to generate a random PID
const generateRandomPID = (): string =>
  Math.random().toString(36).substring(2, 9);

export default function useSSE<T>(url: string): UseSSEReturns<T> {
  const [sse, setSSE] = useState<EventSourceController | null>(null);
  const [pid, setPid] = useState<string | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Disconnect SSE connection
  const disconnect = useCallback(() => {
    if (sse === null) return;

    sse.abort();
    setSSE(null);
    setIsConnected(false);
    setPid(null);
  }, [sse, pid]);

  // Establish SSE connection
  const connect = useCallback(() => {
    // Disconnect first when there is an existing connection
    if (sse !== null) disconnect();

    const _pid = generateRandomPID();
    const eventSourcePlus = new EventSourcePlus(url, {
      maxRetryCount: 5,
      retryStrategy: "on-error",
    });

    const controller = eventSourcePlus.listen({
      // Will be called whenever receiving new message or event.
      onMessage(message) {
        const parsedData = JSON.parse(message.data) as T;
        console.log(SSE_MESSAGE.received, parsedData);
        setData(parsedData);
      },

      // Will be called after receiving a response from the server.
      async onResponse({ response: { status } }) {
        console.debug(SSE_MESSAGE.connected, `status: ${status}`);
      },

      /**
       * Will be called when the request fails.
       * Might be due to connection refused or failed to parse URL
       */
      async onRequestError({ request, error }) {
        setIsConnected(false);
        setError(error.message);
        console.error(SSE_MESSAGE.error.request, request, error);
      },

      /**
       *  Will be fired if one of the following conditions have been met
       *  1. response.ok is not true (i.e. server returned an error status code)
       *  2. The Content-Type header sent by the server doesn't include text/event-stream
       */
      async onResponseError({ request, error }) {
        setIsConnected(false);
        setError(error?.message ?? "Unknown Error");
        console.error(SSE_MESSAGE.error.response, request, error);
      },
    });

    // Update to latest cevent source controller and pid
    setSSE(controller);
    setPid(_pid);
  }, [url]);

  /**
   * Check for SSE connection
   * and set status connected when SSE is available.
   */
  useEffect(() => {
    if (sse === null) return undefined;

    setIsConnected(true);
    console.debug(SSE_MESSAGE.connected, `(PID: ${pid})`);

    return () => {
      console.debug(SSE_MESSAGE.disconnected, `(PID: ${pid})`);
      console.debug(`SSE Cleanup (PID: ${pid})`);
    };
  }, [sse, pid, connect, disconnect]);

  return {
    pid,
    data,
    error,
    connect,
    disconnect,
    isConnected,
  };
}
