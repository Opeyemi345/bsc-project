import { Router } from "express";
import {
    getUserChats,
    createChat,
    getChatById,
    sendMessage,
    markMessagesAsRead,
    deleteMessage,
    addMembersToGroup,
    removeMemberFromGroup
} from "../controllers/chat";
import { verifyToken } from "../controllers/auth";

const chatRoute = Router();

// All chat routes require authentication
chatRoute.use(verifyToken);

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Get all chats for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User chats retrieved successfully
 *       401:
 *         description: Authentication required
 */
chatRoute.get('/', getUserChats);

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantIds
 *             properties:
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to include in chat
 *               chatType:
 *                 type: string
 *                 enum: [direct, group]
 *                 default: direct
 *               chatName:
 *                 type: string
 *                 description: Name for group chats
 *               chatDescription:
 *                 type: string
 *                 description: Description for group chats
 *     responses:
 *       201:
 *         description: Chat created successfully
 *       400:
 *         description: Invalid request data
 */
chatRoute.post('/', createChat);

/**
 * @swagger
 * /chat/{chatId}:
 *   get:
 *     summary: Get chat details and messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for messages
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Chat details and messages retrieved successfully
 *       404:
 *         description: Chat not found or access denied
 */
chatRoute.get('/:chatId', getChatById);

/**
 * @swagger
 * /chat/{chatId}/messages:
 *   post:
 *     summary: Send a message to a chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Message content
 *               messageType:
 *                 type: string
 *                 enum: [text, image, file]
 *                 default: text
 *               fileUrl:
 *                 type: string
 *                 description: URL for file/image messages
 *               fileName:
 *                 type: string
 *                 description: Original filename for file messages
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid message data
 *       404:
 *         description: Chat not found or access denied
 */
chatRoute.post('/:chatId/messages', sendMessage);

/**
 * @swagger
 * /chat/{chatId}/read:
 *   post:
 *     summary: Mark messages as read
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Messages marked as read
 *       404:
 *         description: Chat not found or access denied
 */
chatRoute.post('/:chatId/read', markMessagesAsRead);

/**
 * @swagger
 * /chat/messages/{messageId}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       403:
 *         description: You can only delete your own messages
 *       404:
 *         description: Message not found
 */
chatRoute.delete('/messages/:messageId', deleteMessage);

/**
 * @swagger
 * /chat/{chatId}/members:
 *   post:
 *     summary: Add members to group chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to add to the group
 *     responses:
 *       200:
 *         description: Members added successfully
 *       403:
 *         description: Not authorized to add members
 *       404:
 *         description: Chat not found
 */
chatRoute.post('/:chatId/members', addMembersToGroup);

/**
 * @swagger
 * /chat/{chatId}/members/{userId}:
 *   delete:
 *     summary: Remove member from group chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       403:
 *         description: Not authorized to remove members
 *       404:
 *         description: Chat or user not found
 */
chatRoute.delete('/:chatId/members/:userId', removeMemberFromGroup);

export default chatRoute;
