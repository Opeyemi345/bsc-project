import express from 'express';
import {
  storeFCMToken,
  removeFCMToken,
  sendTestNotification,
  getNotifications,
  markNotificationAsRead,
  subscribeToTopic,
  unsubscribeFromTopic,
  getNotificationStatus,
  sendNotificationToUser,
  sendNotificationToUsers,
  sendNotificationToTopic,
} from '../controllers/notification';
import { verifyToken } from '../controllers/auth';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FCMToken:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           description: Firebase Cloud Messaging token
 *         platform:
 *           type: string
 *           enum: [web, android, ios]
 *           default: web
 *           description: Platform type
 *     
 *     NotificationData:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [message, post, community, system]
 *         entityId:
 *           type: string
 *         senderId:
 *           type: string
 *         senderName:
 *           type: string
 *         url:
 *           type: string
 *     
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *         body:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/NotificationData'
 *         read:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         readAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notifications/status:
 *   get:
 *     summary: Get notification service status
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Notification service status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     configured:
 *                       type: boolean
 *                     message:
 *                       type: string
 */
router.get('/status', getNotificationStatus);

/**
 * @swagger
 * /api/notifications/token:
 *   post:
 *     summary: Store FCM token for authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FCMToken'
 *     responses:
 *       200:
 *         description: FCM token stored successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/token', verifyToken, storeFCMToken);

/**
 * @swagger
 * /api/notifications/token:
 *   delete:
 *     summary: Remove FCM token for authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FCM token removed successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/token', verifyToken, removeFCMToken);

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Send test notification to authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 default: Test Notification
 *               body:
 *                 type: string
 *                 default: This is a test notification from OausConnect!
 *     responses:
 *       200:
 *         description: Test notification sent
 *       401:
 *         description: Unauthorized
 */
router.post('/test', verifyToken, sendTestNotification);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user's notification history
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of notifications to return
 *     responses:
 *       200:
 *         description: User notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyToken, getNotifications);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       400:
 *         description: Invalid notification ID
 */
router.patch('/:notificationId/read', markNotificationAsRead);

/**
 * @swagger
 * /api/notifications/subscribe:
 *   post:
 *     summary: Subscribe to topic notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *             properties:
 *               topic:
 *                 type: string
 *                 description: Topic to subscribe to (e.g., community ID)
 *     responses:
 *       200:
 *         description: Successfully subscribed to topic
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/subscribe', verifyToken, subscribeToTopic);

/**
 * @swagger
 * /api/notifications/unsubscribe:
 *   post:
 *     summary: Unsubscribe from topic notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *             properties:
 *               topic:
 *                 type: string
 *                 description: Topic to unsubscribe from
 *     responses:
 *       200:
 *         description: Successfully unsubscribed from topic
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/unsubscribe', verifyToken, unsubscribeFromTopic);

// Admin routes (you might want to add admin authentication middleware)
/**
 * @swagger
 * /api/notifications/send/user:
 *   post:
 *     summary: Send notification to specific user (Admin)
 *     tags: [Notifications, Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - body
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               data:
 *                 $ref: '#/components/schemas/NotificationData'
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       400:
 *         description: Invalid request data
 */
router.post('/send/user', sendNotificationToUser);

/**
 * @swagger
 * /api/notifications/send/users:
 *   post:
 *     summary: Send notification to multiple users (Admin)
 *     tags: [Notifications, Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - title
 *               - body
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               data:
 *                 $ref: '#/components/schemas/NotificationData'
 *     responses:
 *       200:
 *         description: Notifications sent
 */
router.post('/send/users', sendNotificationToUsers);

/**
 * @swagger
 * /api/notifications/send/topic:
 *   post:
 *     summary: Send notification to topic (Admin)
 *     tags: [Notifications, Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - title
 *               - body
 *             properties:
 *               topic:
 *                 type: string
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               data:
 *                 $ref: '#/components/schemas/NotificationData'
 *     responses:
 *       200:
 *         description: Topic notification sent successfully
 *       400:
 *         description: Invalid request data
 */
router.post('/send/topic', sendNotificationToTopic);

export default router;
