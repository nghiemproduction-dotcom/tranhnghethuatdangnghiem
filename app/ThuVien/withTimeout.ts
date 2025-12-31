// ✅ TIMEOUT WRAPPER for async operations
// Prevents hanging queries and provides fallback

/**
 * Wraps a promise with timeout functionality
 * @param promise The promise to wrap
 * @param ms Timeout in milliseconds (default: 10000ms = 10s)
 * @param timeoutError Custom error message on timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number = 10000,
  timeoutError: string = 'Operation timed out'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutError));
    }, ms);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Create a debounced function that delays invoking until after `ms` milliseconds
 * Useful for search inputs, button clicks, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  ms: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, ms);
  };
}

/**
 * Create a throttled function that only invokes at most once per `ms` milliseconds
 * Useful for scroll handlers, resize handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  ms: number = 300
): (...args: Parameters<T>) => void {
  let lastRun = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastRun >= ms) {
      func(...args);
      lastRun = now;
    }
  };
}
