import {
  sendPushNotification,
  sendPushNotificationToMultiple,
  sendPushNotificationToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  isFirebaseAdminConfigured
} from '../config/firebaseAdmin';
import { adminFirestore } from '../config/firebaseAdmin';

// Types
interface NotificationData {
  type: 'message' | 'post' | 'community' | 'system';
  entityId?: string;
  senderId?: string;
  senderName?: string;
  url?: string;
}

interface UserToken {
  userId: string;
  token: string;
  platform: 'web' | 'android' | 'ios';
  createdAt: Date;
  updatedAt: Date;
}

// Collections
const FCM_TOKENS_COLLECTION = 'fcmTokens';
const NOTIFICATIONS_COLLECTION = 'notifications';

class PushNotificationService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = isFirebaseAdminConfigured();
    if (!this.isConfigured) {
      console.warn('Push notification service is disabled - Firebase Admin not configured');
    }
  }

  // Store FCM token for a user
  async storeUserToken(userId: string, token: string, platform: 'web' | 'android' | 'ios' = 'web'): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      const tokenDoc = adminFirestore.collection(FCM_TOKENS_COLLECTION).doc(userId);
      await tokenDoc.set({
        userId,
        token,
        platform,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      console.log(`FCM token stored for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error storing FCM token:', error);
      return false;
    }
  }

  // Get FCM token for a user
  async getUserToken(userId: string): Promise<string | null> {
    if (!this.isConfigured) return null;

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error('Invalid userId provided to getUserToken:', userId);
      return null;
    }

    try {
      const tokenDoc = await adminFirestore.collection(FCM_TOKENS_COLLECTION).doc(userId.trim()).get();
      if (tokenDoc.exists) {
        const data = tokenDoc.data() as UserToken;
        return data.token;
      }
      return null;
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  }

  // Get FCM tokens for multiple users
  async getUserTokens(userIds: string[]): Promise<string[]> {
    if (!this.isConfigured) return [];

    try {
      const tokens: string[] = [];
      const batch = adminFirestore.batch();

      for (const userId of userIds) {
        const tokenDoc = await adminFirestore.collection(FCM_TOKENS_COLLECTION).doc(userId).get();
        if (tokenDoc.exists) {
          const data = tokenDoc.data() as UserToken;
          if (data.token) {
            tokens.push(data.token);
          }
        }
      }

      return tokens;
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return [];
    }
  }

  // Send notification to a specific user
  async sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<boolean> {
    if (!this.isConfigured) {
      console.log(`Would send notification to user ${userId}: ${title}`);
      return false;
    }

    try {
      const token = await this.getUserToken(userId);
      if (!token) {
        console.log(`No FCM token found for user ${userId}`);
        return false;
      }

      const notificationData: { [key: string]: string } = {};
      if (data) {
        Object.keys(data).forEach(key => {
          notificationData[key] = String(data[key as keyof NotificationData]);
        });
      }

      const success = await sendPushNotification(token, title, body, notificationData);

      if (success) {
        // Store notification in database for history
        await this.storeNotification(userId, title, body, data);
      }

      return success;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return false;
    }
  }

  // Send notification to multiple users
  async sendNotificationToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.isConfigured) {
      console.log(`Would send notification to ${userIds.length} users: ${title}`);
      return { successCount: 0, failureCount: userIds.length };
    }

    try {
      const tokens = await this.getUserTokens(userIds);
      if (tokens.length === 0) {
        console.log('No FCM tokens found for any users');
        return { successCount: 0, failureCount: userIds.length };
      }

      const notificationData: { [key: string]: string } = {};
      if (data) {
        Object.keys(data).forEach(key => {
          notificationData[key] = String(data[key as keyof NotificationData]);
        });
      }

      const result = await sendPushNotificationToMultiple(tokens, title, body, notificationData);

      // Store notifications in database for history
      for (const userId of userIds) {
        await this.storeNotification(userId, title, body, data);
      }

      return result;
    } catch (error) {
      console.error('Error sending notifications to users:', error);
      return { successCount: 0, failureCount: userIds.length };
    }
  }

  // Send notification to a topic (e.g., all users in a community)
  async sendNotificationToTopic(
    topic: string,
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<boolean> {
    if (!this.isConfigured) {
      console.log(`Would send notification to topic ${topic}: ${title}`);
      return false;
    }

    try {
      const notificationData: { [key: string]: string } = {};
      if (data) {
        Object.keys(data).forEach(key => {
          notificationData[key] = String(data[key as keyof NotificationData]);
        });
      }

      return await sendPushNotificationToTopic(topic, title, body, notificationData);
    } catch (error) {
      console.error('Error sending notification to topic:', error);
      return false;
    }
  }

  // Subscribe user to topic
  async subscribeUserToTopic(userId: string, topic: string): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      const token = await this.getUserToken(userId);
      if (!token) {
        console.log(`No FCM token found for user ${userId}`);
        return false;
      }

      return await subscribeToTopic([token], topic);
    } catch (error) {
      console.error('Error subscribing user to topic:', error);
      return false;
    }
  }

  // Unsubscribe user from topic
  async unsubscribeUserFromTopic(userId: string, topic: string): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      const token = await this.getUserToken(userId);
      if (!token) {
        console.log(`No FCM token found for user ${userId}`);
        return false;
      }

      return await unsubscribeFromTopic([token], topic);
    } catch (error) {
      console.error('Error unsubscribing user from topic:', error);
      return false;
    }
  }

  // Store notification in database for history
  private async storeNotification(
    userId: string,
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<void> {
    try {
      await adminFirestore.collection(NOTIFICATIONS_COLLECTION).add({
        userId,
        title,
        body,
        data: data || {},
        createdAt: new Date(),
        read: false,
      });
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  // Get user's notification history
  async getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
    if (!this.isConfigured) return [];

    try {
      const snapshot = await adminFirestore
        .collection(NOTIFICATIONS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const notifications: any[] = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });

      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      await adminFirestore.collection(NOTIFICATIONS_COLLECTION).doc(notificationId).update({
        read: true,
        readAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Remove user's FCM token (for logout)
  async removeUserToken(userId: string): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      await adminFirestore.collection(FCM_TOKENS_COLLECTION).doc(userId).delete();
      console.log(`FCM token removed for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error removing FCM token:', error);
      return false;
    }
  }

  // Check if service is configured
  isServiceConfigured(): boolean {
    return this.isConfigured;
  }
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService();

// Helper functions for common notification types
export const sendNewMessageNotification = async (
  recipientId: string,
  senderName: string,
  messageContent: string,
  chatId: string
): Promise<boolean> => {
  return await pushNotificationService.sendNotificationToUser(
    recipientId,
    `New message from ${senderName}`,
    messageContent,
    {
      type: 'message',
      entityId: chatId,
      senderName,
      url: `/chat/${chatId}`,
    }
  );
};

export const sendNewPostNotification = async (
  userIds: string[],
  authorName: string,
  postTitle: string,
  postId: string
): Promise<{ successCount: number; failureCount: number }> => {
  return await pushNotificationService.sendNotificationToUsers(
    userIds,
    `New post by ${authorName}`,
    postTitle,
    {
      type: 'post',
      entityId: postId,
      senderName: authorName,
      url: `/posts/${postId}`,
    }
  );
};

export const sendCommunityNotification = async (
  communityTopic: string,
  title: string,
  body: string,
  communityId: string
): Promise<boolean> => {
  return await pushNotificationService.sendNotificationToTopic(
    communityTopic,
    title,
    body,
    {
      type: 'community',
      entityId: communityId,
      url: `/communities/${communityId}`,
    }
  );
};
