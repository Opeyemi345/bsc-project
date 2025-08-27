import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';

// VAPID key for FCM (you'll need to generate this in Firebase Console)
const VAPID_KEY = (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY;

// Collection for storing FCM tokens
const FCM_TOKENS_COLLECTION = 'fcmTokens';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: { [key: string]: string };
}

export class NotificationService {
  private messaging: any = null;
  private currentToken: string | null = null;

  constructor() {
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        // Only initialize if we have proper Firebase configuration
        if (this.isFirebaseConfigured()) {
          this.messaging = getMessaging();
        } else {
          console.log('Firebase not configured - push notifications disabled');
        }
      }
    } catch (error) {
      console.log('Firebase messaging not available:', error.message);
    }
  }

  // Check if Firebase is properly configured
  private isFirebaseConfigured(): boolean {
    const firebaseConfig = (import.meta as any).env;
    return !!(
      firebaseConfig?.VITE_FIREBASE_API_KEY &&
      firebaseConfig?.VITE_FIREBASE_PROJECT_ID &&
      firebaseConfig?.VITE_FIREBASE_MESSAGING_SENDER_ID &&
      firebaseConfig?.VITE_FIREBASE_APP_ID &&
      VAPID_KEY
    );
  }

  // Request notification permission and get FCM token
  async requestPermission(userId: string): Promise<string | null> {
    if (!this.messaging) {
      console.log('Firebase messaging not initialized - push notifications disabled');
      return null;
    }

    if (!this.isFirebaseConfigured()) {
      console.log('Firebase not properly configured - push notifications disabled');
      return null;
    }

    if (!VAPID_KEY || VAPID_KEY.includes('your-vapid-key')) {
      console.warn('VAPID key not configured - push notifications disabled. Please configure VITE_FIREBASE_VAPID_KEY in your .env file.');
      return null;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        console.log('Notification permission denied');
        // Don't show error toast, just log it
        return null;
      }

      // Register service worker
      await this.registerServiceWorker();

      // Get FCM token
      const token = await getToken(this.messaging, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        console.log('FCM Token:', token);
        this.currentToken = token;

        // Store token in backend
        await this.storeTokenInBackend(token);

        console.log('Push notifications enabled successfully');
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      // Don't show error toast to user, just log it
      return null;
    }
  }

  // Register service worker for background notifications
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        // Check if service worker file exists
        const response = await fetch('/firebase-messaging-sw.js');
        if (!response.ok) {
          console.log('Firebase service worker not found - using default registration');
          return;
        }

        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Firebase Service Worker registered:', registration);
      } catch (error) {
        console.log('Service Worker registration failed - continuing without push notifications:', error.message);
        // Don't throw error, just continue without push notifications
      }
    }
  }

  // Store FCM token in backend
  private async storeTokenInBackend(token: string): Promise<void> {
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/notifications/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          token,
          platform: 'web',
        }),
      });

      if (response.ok) {
        console.log('FCM token stored in backend');
      } else {
        console.error('Failed to store FCM token in backend');
      }
    } catch (error) {
      console.error('Error storing FCM token in backend:', error);
    }
  }

  // Get stored FCM token for a user
  async getStoredToken(userId: string): Promise<string | null> {
    try {
      const tokenDoc = doc(db, FCM_TOKENS_COLLECTION, userId);
      const docSnap = await getDoc(tokenDoc);

      if (docSnap.exists()) {
        return docSnap.data().token;
      }
      return null;
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  // Listen for foreground messages
  onForegroundMessage(callback: (payload: any) => void): (() => void) | null {
    if (!this.messaging) {
      return null;
    }

    return onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload);

      // Show toast notification for foreground messages
      if (payload.notification) {
        const title = payload.notification.title || '';
        const body = payload.notification.body || '';

        toast.info(`${title}: ${body}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      callback(payload);
    });
  }

  // Delete FCM token (for logout)
  async deleteToken(): Promise<void> {
    if (!this.messaging || !this.currentToken) {
      return;
    }

    try {
      // Delete token from Firebase
      await deleteToken(this.messaging);

      // Remove token from backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/token`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        console.log('FCM token removed from backend');
      }

      this.currentToken = null;
      console.log('FCM token deleted');
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  }

  // Check if notifications are supported
  isNotificationSupported(): boolean {
    return (
      'Notification' in window &&
      'serviceWorker' in navigator &&
      !!this.messaging &&
      this.isFirebaseConfigured()
    );
  }

  // Get current notification permission status
  getNotificationPermission(): NotificationPermission {
    return Notification.permission;
  }

  // Show local notification (for testing)
  showLocalNotification(title: string, body: string, data?: any): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data,
        tag: 'oausconnect-local'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  // Send notification to specific user (this would typically be done from backend)
  async sendNotificationToUser(
    targetUserId: string,
    notification: NotificationPayload
  ): Promise<boolean> {
    try {
      // Get the target user's FCM token
      const token = await this.getStoredToken(targetUserId);

      if (!token) {
        console.log('No FCM token found for user:', targetUserId);
        return false;
      }

      // In a real app, you would send this to your backend
      // which would then use Firebase Admin SDK to send the notification
      console.log('Would send notification to token:', token);
      console.log('Notification payload:', notification);

      // For demo purposes, show a local notification
      this.showLocalNotification(notification.title, notification.body, notification.data);

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Get current FCM token
  getCurrentToken(): string | null {
    return this.currentToken;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Helper function to initialize notifications for a user
export const initializeNotifications = async (userId: string): Promise<void> => {
  try {
    if (!notificationService.isNotificationSupported()) {
      console.log('Notifications not supported in this browser');
      return;
    }

    const permission = notificationService.getNotificationPermission();

    if (permission === 'default') {
      // Request permission
      await notificationService.requestPermission(userId);
    } else if (permission === 'granted') {
      // Permission already granted, just get/update token
      await notificationService.requestPermission(userId);
    } else {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
    // Don't show error toast to user, just log it
  }
};

// Helper function to setup foreground message listener
export const setupForegroundMessageListener = (callback?: (payload: any) => void) => {
  return notificationService.onForegroundMessage((payload) => {
    // Handle the message
    console.log('Received foreground message:', payload);

    if (callback) {
      callback(payload);
    }
  });
};
