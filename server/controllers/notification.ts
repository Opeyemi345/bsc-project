import { Request, Response, NextFunction } from 'express';
import { pushNotificationService } from '../services/pushNotificationService';
import { AppError } from '../utils/errorHandler';
import { CustomRequest } from '../types/User';

// Store FCM token for authenticated user
export const storeFCMToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { token, platform = 'web' } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!token) {
      return next(new AppError('FCM token is required', 400));
    }

    const success = await pushNotificationService.storeUserToken(
      userId,
      token,
      platform as 'web' | 'android' | 'ios'
    );

    if (success) {
      res.status(200).json({
        success: true,
        message: 'FCM token stored successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to store FCM token',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Remove FCM token for authenticated user
export const removeFCMToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const success = await pushNotificationService.removeUserToken(userId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'FCM token removed successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to remove FCM token',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Send test notification to authenticated user
export const sendTestNotification = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { title = 'Test Notification', body = 'This is a test notification from OausConnect!' } = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const success = await pushNotificationService.sendNotificationToUser(
      userId,
      title,
      body,
      {
        type: 'system',
        url: '/',
      }
    );

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Test notification sent successfully',
      });
    } else {
      res.status(200).json({
        success: false,
        message: 'Failed to send test notification (this is normal if push notifications are not configured)',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get user's notification history
export const getNotifications = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const notifications = await pushNotificationService.getUserNotifications(userId, limit);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return next(new AppError('Notification ID is required', 400));
    }

    const success = await pushNotificationService.markNotificationAsRead(notificationId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Subscribe to community topic
export const subscribeToTopic = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { topic } = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!topic) {
      return next(new AppError('Topic is required', 400));
    }

    const success = await pushNotificationService.subscribeUserToTopic(userId, topic);

    if (success) {
      res.status(200).json({
        success: true,
        message: `Subscribed to topic: ${topic}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe to topic',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Unsubscribe from community topic
export const unsubscribeFromTopic = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { topic } = req.body;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!topic) {
      return next(new AppError('Topic is required', 400));
    }

    const success = await pushNotificationService.unsubscribeUserFromTopic(userId, topic);

    if (success) {
      res.status(200).json({
        success: true,
        message: `Unsubscribed from topic: ${topic}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to unsubscribe from topic',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get notification service status
export const getNotificationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isConfigured = pushNotificationService.isServiceConfigured();

    res.status(200).json({
      success: true,
      data: {
        configured: isConfigured,
        message: isConfigured 
          ? 'Push notification service is configured and ready'
          : 'Push notification service is not configured - Firebase Admin SDK credentials missing',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Send notification to specific user (for testing/admin purposes)
export const sendNotificationToUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return next(new AppError('userId, title, and body are required', 400));
    }

    const success = await pushNotificationService.sendNotificationToUser(
      userId,
      title,
      body,
      data
    );

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Notification sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Admin: Send notification to multiple users
export const sendNotificationToUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userIds, title, body, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || !title || !body) {
      return next(new AppError('userIds (array), title, and body are required', 400));
    }

    const result = await pushNotificationService.sendNotificationToUsers(
      userIds,
      title,
      body,
      data
    );

    res.status(200).json({
      success: true,
      message: `Notifications sent: ${result.successCount} successful, ${result.failureCount} failed`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Send notification to topic
export const sendNotificationToTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, title, body, data } = req.body;

    if (!topic || !title || !body) {
      return next(new AppError('topic, title, and body are required', 400));
    }

    const success = await pushNotificationService.sendNotificationToTopic(
      topic,
      title,
      body,
      data
    );

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Topic notification sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send topic notification',
      });
    }
  } catch (error) {
    next(error);
  }
};
