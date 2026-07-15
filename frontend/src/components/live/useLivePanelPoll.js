import { useCallback, useEffect, useState } from "react";

/**
 * @param {() => Promise<{ pollIntervalMs?: number }>} fetchFn
 * @param {{ shouldPoll?: (data: unknown) => boolean }} options
 */
export default function useLivePanelPoll(fetchFn, { shouldPoll = () => true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (isInitial = false) => {
      if (isInitial) setLoading(true);
      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        if (isInitial) setLoading(false);
      }
    },
    [fetchFn]
  );

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    if (!data || !shouldPoll(data)) return undefined;

    const intervalMs = data.pollIntervalMs;
    if (!intervalMs || intervalMs <= 0) return undefined;

    const timerId = setInterval(() => {
      load(false);
    }, intervalMs);

    return () => clearInterval(timerId);
  }, [data, shouldPoll, load]);

  return { data, error, loading, reload: () => load(false) };
}
