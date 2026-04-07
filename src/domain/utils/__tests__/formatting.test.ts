/**
 * Tests: Formatting Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatDate,
  formatElapsedTime,
  formatElapsedTimeFromSeconds,
  formatDuration,
  formatMessageTimestamp,
} from '../formatting';

describe('Formatting Utilities', () => {
  describe('formatTime', () => {
    it('formats time in 12-hour format', () => {
      const date = new Date('2026-02-01T14:30:00');
      const result = formatTime(date);
      expect(result).toMatch(/02:30 PM|2:30 PM/); // Allow both formats
    });
  });

  describe('formatDate', () => {
    it('formats date in readable format', () => {
      const date = new Date('2026-02-01T14:30:00');
      const result = formatDate(date);
      expect(result).toBe('Feb 1, 2026');
    });
  });

  describe('formatElapsedTime', () => {
    it('formats milliseconds as MM:SS', () => {
      expect(formatElapsedTime(0)).toBe('0:00');
      expect(formatElapsedTime(5000)).toBe('0:05');
      expect(formatElapsedTime(65000)).toBe('1:05');
      expect(formatElapsedTime(3661000)).toBe('61:01');
    });
  });

  describe('formatElapsedTimeFromSeconds', () => {
    it('formats seconds as MM:SS', () => {
      expect(formatElapsedTimeFromSeconds(0)).toBe('0:00');
      expect(formatElapsedTimeFromSeconds(5)).toBe('0:05');
      expect(formatElapsedTimeFromSeconds(65)).toBe('1:05');
      expect(formatElapsedTimeFromSeconds(3661)).toBe('61:01');
    });
  });

  describe('formatDuration', () => {
    it('formats short durations in seconds', () => {
      expect(formatDuration(5)).toBe('5s');
      expect(formatDuration(45)).toBe('45s');
    });

    it('formats longer durations in minutes and seconds', () => {
      expect(formatDuration(65)).toBe('1m 5s');
      expect(formatDuration(125)).toBe('2m 5s');
      expect(formatDuration(3661)).toBe('61m 1s');
    });
  });

  describe('formatMessageTimestamp', () => {
    it('shows time for messages from today', () => {
      const now = new Date();
      const result = formatMessageTimestamp(now);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('shows "Yesterday" for messages from yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = formatMessageTimestamp(yesterday);
      expect(result).toContain('Yesterday');
    });

    it('shows full date for older messages', () => {
      const oldDate = new Date('2026-01-01T10:00:00');
      const result = formatMessageTimestamp(oldDate);
      expect(result).toContain('Jan 1, 2026');
    });
  });
});
