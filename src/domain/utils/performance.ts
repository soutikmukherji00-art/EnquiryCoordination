/**
 * Performance Monitoring Utilities
 * 
 * Lightweight performance tracking for identifying bottlenecks
 */

interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private marks: Map<string, PerformanceMark> = new Map();
  private enabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * Start measuring performance for an operation
   */
  start(name: string): void {
    if (!this.enabled) return;
    
    this.marks.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * End measuring and log if duration exceeds threshold
   */
  end(name: string, warnThresholdMs: number = 100): void {
    if (!this.enabled) return;
    
    const mark = this.marks.get(name);
    if (!mark) {
      console.warn(`[Performance] No start mark found for: ${name}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - mark.startTime;
    
    mark.endTime = endTime;
    mark.duration = duration;

    // Log slow operations
    if (duration > warnThresholdMs) {
      console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    this.marks.delete(name);
  }

  /**
   * Measure a function execution
   */
  measure<T>(name: string, fn: () => T, warnThresholdMs?: number): T {
    if (!this.enabled) return fn();
    
    this.start(name);
    try {
      return fn();
    } finally {
      this.end(name, warnThresholdMs);
    }
  }

  /**
   * Measure an async function execution
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, warnThresholdMs?: number): Promise<T> {
    if (!this.enabled) return fn();
    
    this.start(name);
    try {
      return await fn();
    } finally {
      this.end(name, warnThresholdMs);
    }
  }

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get all current marks (for debugging)
   */
  getAllMarks(): PerformanceMark[] {
    return Array.from(this.marks.values());
  }

  /**
   * Clear all marks
   */
  clear(): void {
    this.marks.clear();
  }
}

// Singleton instance
export const perfMonitor = new PerformanceMonitor();

/**
 * HOC to measure React component render time
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return (props: P) => {
    perfMonitor.start(`render:${componentName}`);
    const result = Component(props);
    perfMonitor.end(`render:${componentName}`, 16); // Warn if render takes > 16ms (60fps)
    return result;
  };
}
