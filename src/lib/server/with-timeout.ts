type Settled<T> =
  | { ok: true; value: T }
  | { ok: false; error: unknown }
  | { ok: false; timeout: true };

/**
 * Race a promise against a timeout.
 * Always resolves with a value: never rejects.
 * Also absorbs late rejections after a timeout so they cannot crash the RSC render.
 */
export async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const settled: Promise<Settled<T>> = promise.then(
    (value) => ({ ok: true, value }),
    (error) => ({ ok: false, error })
  );

  try {
    const result = await Promise.race<Settled<T>>([
      settled,
      new Promise<Settled<T>>((resolve) => {
        timer = setTimeout(() => resolve({ ok: false, timeout: true }), ms);
      }),
    ]);

    if (result.ok) return result.value;

    if ("timeout" in result) {
      console.warn(`[withTimeout] timed out after ${ms}ms; using fallback`);
      // Keep consuming the original promise so a late reject is not unhandled.
      void settled.then(
        () => undefined,
        () => undefined
      );
      return fallback;
    }

    console.error("[withTimeout] promise rejected; using fallback:", result.error);
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
