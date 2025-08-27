import admin from 'firebase-admin';

// Firebase Admin SDK configuration
const firebaseConfig = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
  universe_domain: 'googleapis.com'
};

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App;

try {
  // Check if Firebase Admin is already initialized
  firebaseApp = admin.app();
} catch (error) {
  // Only initialize Firebase if all required environment variables are present
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('Firebase Admin initialized successfully');
  } else {
    console.warn('Firebase Admin not initialized - missing environment variables');
    // Create a mock app for development
    firebaseApp = null as any;
  }
}

// Export Firebase Admin services (conditional)
export const adminAuth = firebaseApp ? admin.auth(firebaseApp) : null;
export const adminFirestore = firebaseApp ? admin.firestore(firebaseApp) : null;
export const adminMessaging = firebaseApp ? admin.messaging(firebaseApp) : null;
export const adminStorage = firebaseApp ? admin.storage(firebaseApp) : null;

// Helper functions for push notifications
export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data?: { [key: string]: string }
): Promise<boolean> => {
  try {
    if (!adminMessaging) {
      console.warn('Firebase messaging not initialized - push notification skipped');
      return false;
    }

    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
      },
      data: data || {},
      webpush: {
        notification: {
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: true,
        },
        fcmOptions: {
          link: process.env.CLIENT_URL || 'http://localhost:3000',
        },
      },
    };

    const response = await adminMessaging.send(message);
    console.log('Push notification sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

// Send notification to multiple tokens
export const sendPushNotificationToMultiple = async (
  tokens: string[],
  title: string,
  body: string,
  data?: { [key: string]: string }
): Promise<{ successCount: number; failureCount: number }> => {
  try {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
      },
      data: data || {},
      webpush: {
        notification: {
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: true,
        },
        fcmOptions: {
          link: process.env.CLIENT_URL || 'http://localhost:3000',
        },
      },
    };

    const response = await adminMessaging.sendEachForMulticast(message);
    console.log(`Push notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return { successCount: 0, failureCount: tokens.length };
  }
};

// Send notification to a topic
export const sendPushNotificationToTopic = async (
  topic: string,
  title: string,
  body: string,
  data?: { [key: string]: string }
): Promise<boolean> => {
  try {
    const message: admin.messaging.Message = {
      topic,
      notification: {
        title,
        body,
      },
      data: data || {},
      webpush: {
        notification: {
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: true,
        },
        fcmOptions: {
          link: process.env.CLIENT_URL || 'http://localhost:3000',
        },
      },
    };

    const response = await adminMessaging.send(message);
    console.log('Topic notification sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending topic notification:', error);
    return false;
  }
};

// Subscribe user to topic
export const subscribeToTopic = async (tokens: string[], topic: string): Promise<boolean> => {
  try {
    const response = await adminMessaging.subscribeToTopic(tokens, topic);
    console.log('Successfully subscribed to topic:', response);
    return true;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    return false;
  }
};

// Unsubscribe user from topic
export const unsubscribeFromTopic = async (tokens: string[], topic: string): Promise<boolean> => {
  try {
    const response = await adminMessaging.unsubscribeFromTopic(tokens, topic);
    console.log('Successfully unsubscribed from topic:', response);
    return true;
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    return false;
  }
};

// Verify Firebase ID token
export const verifyFirebaseToken = async (idToken: string): Promise<admin.auth.DecodedIdToken | null> => {
  try {
    if (!adminAuth) {
      console.warn('Firebase auth not initialized - token verification skipped');
      return null;
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
};

// Create custom token for user
export const createCustomToken = async (uid: string, additionalClaims?: object): Promise<string | null> => {
  try {
    const customToken = await adminAuth.createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    console.error('Error creating custom token:', error);
    return null;
  }
};

// Get user by UID
export const getFirebaseUser = async (uid: string): Promise<admin.auth.UserRecord | null> => {
  try {
    const userRecord = await adminAuth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error getting Firebase user:', error);
    return null;
  }
};

// Helper function to check if Firebase Admin is properly configured
export const isFirebaseAdminConfigured = (): boolean => {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  );
};

// Initialize Firebase Admin
export const initializeFirebaseAdmin = (): void => {
  if (!isFirebaseAdminConfigured()) {
    console.warn('Firebase Admin SDK is not properly configured. Push notifications will be disabled.');
    return;
  }

  console.log('Firebase Admin SDK initialized successfully');
};

export default firebaseApp;
