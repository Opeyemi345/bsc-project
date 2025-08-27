// Firebase Error Handler and Compatibility Layer
// This file provides a robust error handling layer for Firebase operations
// and ensures compatibility across different Firebase versions

import { toast } from 'react-toastify';

export interface FirebaseErrorInfo {
  code?: string;
  message: string;
  operation: string;
  timestamp: Date;
}

export class FirebaseErrorHandler {
  private static instance: FirebaseErrorHandler;
  private errorLog: FirebaseErrorInfo[] = [];

  private constructor() {}

  public static getInstance(): FirebaseErrorHandler {
    if (!FirebaseErrorHandler.instance) {
      FirebaseErrorHandler.instance = new FirebaseErrorHandler();
    }
    return FirebaseErrorHandler.instance;
  }

  public handleError(error: any, operation: string, showToast: boolean = false): void {
    const errorInfo: FirebaseErrorInfo = {
      code: error?.code || 'unknown',
      message: error?.message || 'Unknown Firebase error',
      operation,
      timestamp: new Date()
    };

    // Log error
    console.error(`Firebase ${operation} error:`, errorInfo);
    this.errorLog.push(errorInfo);

    // Show user-friendly toast if requested
    if (showToast) {
      this.showUserFriendlyError(errorInfo);
    }

    // Keep only last 100 errors to prevent memory leaks
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }

  private showUserFriendlyError(errorInfo: FirebaseErrorInfo): void {
    let userMessage = 'An error occurred. Please try again.';

    // Map Firebase error codes to user-friendly messages
    switch (errorInfo.code) {
      case 'permission-denied':
        userMessage = 'You don\'t have permission to perform this action.';
        break;
      case 'unavailable':
        userMessage = 'Service is temporarily unavailable. Please try again later.';
        break;
      case 'network-request-failed':
        userMessage = 'Network error. Please check your connection.';
        break;
      case 'quota-exceeded':
        userMessage = 'Service quota exceeded. Please try again later.';
        break;
      default:
        if (errorInfo.operation.includes('chat')) {
          userMessage = 'Chat service error. Please refresh and try again.';
        } else if (errorInfo.operation.includes('notification')) {
          userMessage = 'Notification service error.';
        }
    }

    toast.error(userMessage);
  }

  public getRecentErrors(count: number = 10): FirebaseErrorInfo[] {
    return this.errorLog.slice(-count);
  }

  public clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Singleton instance
export const firebaseErrorHandler = FirebaseErrorHandler.getInstance();

// Utility functions for common Firebase operations
export const safeFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  fallbackValue: T,
  showToast: boolean = false
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    firebaseErrorHandler.handleError(error, operationName, showToast);
    return fallbackValue;
  }
};

export const safeFirebaseCallback = <T>(
  callback: (data: T) => void,
  operationName: string,
  fallbackData: T
) => {
  return (data: T) => {
    try {
      callback(data);
    } catch (error) {
      firebaseErrorHandler.handleError(error, `${operationName} callback`, false);
      callback(fallbackData);
    }
  };
};

// Firebase version compatibility helpers
export const getFirebaseCompatibleTimestamp = () => {
  try {
    // Try to use serverTimestamp from Firebase
    const { serverTimestamp } = require('firebase/firestore');
    return serverTimestamp();
  } catch (error) {
    // Fallback to current timestamp
    return new Date();
  }
};

// Export error handler for use in other files
export default firebaseErrorHandler;
