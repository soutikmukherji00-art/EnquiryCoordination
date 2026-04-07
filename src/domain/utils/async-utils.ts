/**
 * Async Utilities
 * 
 * Common async patterns and helpers for the application.
 */

import { logger } from './logger';

/**
 * Retry an async operation with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );
        
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
          error: lastError.message,
        });
        
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }
        
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce an async function
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  return function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (pendingPromise) {
      return pendingPromise;
    }

    pendingPromise = new Promise<ReturnType<T>>((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          pendingPromise = null;
          timeoutId = null;
        }
      }, delay);
    });

    return pendingPromise;
  };
}

/**
 * Throttle an async function
 */
export function throttleAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let lastRun = 0;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  return function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    const now = Date.now();

    if (pendingPromise) {
      return pendingPromise;
    }

    if (now - lastRun >= delay) {
      lastRun = now;
      return fn.apply(this, args);
    }

    pendingPromise = new Promise<ReturnType<T>>((resolve, reject) => {
      setTimeout(async () => {
        try {
          lastRun = Date.now();
          const result = await fn.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          pendingPromise = null;
        }
      }, delay - (now - lastRun));
    });

    return pendingPromise;
  };
}

/**
 * Run multiple async operations in parallel with a concurrency limit
 */
export async function parallelAsync<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<any>,
  concurrency: number = 5
): Promise<any[]> {
  const results: any[] = [];
  const executing: Promise<any>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const promise = fn(item, i).then(result => {
      results[i] = result;
      executing.splice(executing.indexOf(promise), 1);
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Run async operations in sequence
 */
export async function sequenceAsync<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<any>
): Promise<any[]> {
  const results: any[] = [];

  for (let i = 0; i < items.length; i++) {
    results.push(await fn(items[i], i));
  }

  return results;
}

/**
 * Timeout wrapper for async operations
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: Error = new Error('Operation timed out')
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(timeoutError), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

/**
 * Memoize async function results
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyFn?: (...args: Parameters<T>) => string;
    ttl?: number; // Time to live in ms
  } = {}
): T {
  const cache = new Map<string, { value: any; expiry: number }>();
  const { keyFn = (...args) => JSON.stringify(args), ttl = Infinity } = options;

  return (async (...args: Parameters<T>) => {
    const key = keyFn(...args);
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && now < cached.expiry) {
      return cached.value;
    }

    const value = await fn(...args);
    cache.set(key, { value, expiry: now + ttl });
    return value;
  }) as T;
}

/**
 * Cancel previous pending operation and start new one
 */
export function cancelableAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T
): {
  execute: (...args: Parameters<T>) => Promise<ReturnType<T>>;
  cancel: () => void;
} {
  let currentPromise: {
    cancel: () => void;
    promise: Promise<ReturnType<T>>;
  } | null = null;

  return {
    execute: (...args: Parameters<T>) => {
      if (currentPromise) {
        currentPromise.cancel();
      }

      let cancelled = false;
      const promise = (async () => {
        try {
          const result = await fn(...args);
          if (!cancelled) {
            return result;
          }
        } catch (error) {
          if (!cancelled) {
            throw error;
          }
        }
        throw new Error('Operation cancelled');
      })();

      currentPromise = {
        cancel: () => { cancelled = true; },
        promise: promise as Promise<ReturnType<T>>,
      };

      return promise as Promise<ReturnType<T>>;
    },
    cancel: () => {
      if (currentPromise) {
        currentPromise.cancel();
        currentPromise = null;
      }
    },
  };
}

/**
 * Poll an async function until a condition is met
 */
export async function pollAsync<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  options: {
    interval?: number;
    maxAttempts?: number;
    timeout?: number;
  } = {}
): Promise<T> {
  const { interval = 1000, maxAttempts = Infinity, timeout = Infinity } = options;
  const startTime = Date.now();
  let attempts = 0;

  while (true) {
    if (attempts >= maxAttempts) {
      throw new Error('Max polling attempts reached');
    }

    if (Date.now() - startTime >= timeout) {
      throw new Error('Polling timeout');
    }

    const result = await fn();
    
    if (condition(result)) {
      return result;
    }

    attempts++;
    await sleep(interval);
  }
}

/**
 * Batch async operations
 */
export async function batchAsync<T, R>(
  items: T[],
  fn: (batch: T[]) => Promise<R[]>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await fn(batch);
    results.push(...batchResults);
  }

  return results;
}
