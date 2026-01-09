// ✅ SUPABASE QUERY TIMEOUT WRAPPER
// Prevents hanging queries by adding timeout

export class QueryTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryTimeoutError';
  }
}

/**
 * Wrap a promise with a timeout
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds (default: 10000ms = 10s)
 * @param errorMessage - Custom error message
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Truy vấn quá lâu, vui lòng thử lại'
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new QueryTimeoutError(errorMessage));
    }, timeoutMs);
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
 * Wrap Supabase query with timeout
 * Usage:
 * ```ts
 * const { data, error } = await withQueryTimeout(
 *   supabase.from('don_hang').select('*'),
 *   8000, // 8 second timeout
 *   'Không thể tải đơn hàng'
 * );
 * ```
 */
export async function withQueryTimeout<T>(
  queryPromise: Promise<{ data: T | null; error: any }>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Truy vấn quá lâu'
): Promise<{ data: T | null; error: any }> {
  try {
    return await withTimeout(queryPromise, timeoutMs, errorMessage);
  } catch (error) {
    if (error instanceof QueryTimeoutError) {
      return {
        data: null,
        error: { message: error.message, code: 'QUERY_TIMEOUT' },
      };
    }
    throw error;
  }
}
