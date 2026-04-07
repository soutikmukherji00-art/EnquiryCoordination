/**
 * Centralized Error Handling Utility
 * 
 * Provides consistent error handling, formatting, and user-friendly messages.
 */

import { logger } from './logger';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context, 'Please check your input and try again.');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string, context?: Record<string, any>) {
    super(
      `${resource} not found: ${id}`,
      'NOT_FOUND',
      context,
      `The requested ${resource.toLowerCase()} could not be found.`
    );
    this.name = 'NotFoundError';
  }
}

export class PermissionError extends AppError {
  constructor(action: string, context?: Record<string, any>) {
    super(
      `Permission denied: ${action}`,
      'PERMISSION_DENIED',
      context,
      'You do not have permission to perform this action.'
    );
    this.name = 'PermissionError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'NETWORK_ERROR',
      context,
      'A network error occurred. Please check your connection and try again.'
    );
    this.name = 'NetworkError';
  }
}

/**
 * Error handler function
 */
export function handleError(error: unknown, context?: string): AppError {
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    logger.error(`${context ? `[${context}]` : ''} ${error.message}`, {
      code: error.code,
      context: error.context,
    });
    return error;
  }

  // If it's a standard Error
  if (error instanceof Error) {
    logger.error(`${context ? `[${context}]` : ''} ${error.message}`, error);
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      { originalError: error.name },
      'An unexpected error occurred. Please try again.'
    );
  }

  // If it's an unknown error type
  const message = String(error);
  logger.error(`${context ? `[${context}]` : ''} Unknown error`, { error });
  return new AppError(
    message,
    'UNKNOWN_ERROR',
    { error },
    'An unexpected error occurred. Please try again.'
  );
}

/**
 * Safe async wrapper that handles errors
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    return { error: handleError(error, context) };
  }
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(error: unknown): string {
  if (error instanceof AppError && error.userMessage) {
    return error.userMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: unknown, type: string): boolean {
  return error instanceof AppError && error.name === type;
}
