import { Router } from "express";
import {
    getAllContent,
    getContentById,
    createContent,
    updateContent,
    deleteContent,
    voteContent,
    getUserContent
} from "../controllers/content";
import {
    getComments,
    createComment,
    updateComment,
    deleteComment,
    getReplies,
    voteComment
} from "../controllers/comment";
import { verifyToken, optionalAuth } from "../controllers/auth";

const contentRoute = Router();

/**
 * @swagger
 * /content:
 *   get:
 *     summary: Get all content/posts
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of content retrieved successfully
 */
contentRoute.get('/', optionalAuth, getAllContent);

/**
 * @swagger
 * /content/{id}:
 *   get:
 *     summary: Get content by ID
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 *       404:
 *         description: Content not found
 */
contentRoute.get('/:id', optionalAuth, getContentById);

/**
 * @swagger
 * /content:
 *   post:
 *     summary: Create new content/post
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Text content
 *               media:
 *                 type: string
 *                 description: Media URL
 *               mediaType:
 *                 type: string
 *                 enum: [image, video, file]
 *                 description: Type of media
 *     responses:
 *       201:
 *         description: Content created successfully
 *       400:
 *         description: Content or media is required
 *       401:
 *         description: Authentication required
 */
contentRoute.post('/', verifyToken, createContent);

/**
 * @swagger
 * /content/{id}:
 *   put:
 *     summary: Update content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       403:
 *         description: You can only update your own content
 *       404:
 *         description: Content not found
 */
contentRoute.put('/:id', verifyToken, updateContent);

/**
 * @swagger
 * /content/{id}:
 *   delete:
 *     summary: Delete content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       403:
 *         description: You can only delete your own content
 *       404:
 *         description: Content not found
 */
contentRoute.delete('/:id', verifyToken, deleteContent);

/**
 * @swagger
 * /content/{id}/upvote:
 *   post:
 *     summary: Vote on content (upvote, downvote, or remove vote)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voteType:
 *                 type: string
 *                 enum: [upvote, downvote, remove]
 *                 description: Type of vote
 *     responses:
 *       200:
 *         description: Vote updated successfully
 *       400:
 *         description: Invalid vote type
 *       404:
 *         description: Content not found
 */
contentRoute.post('/:id/upvote', verifyToken, voteContent);

/**
 * @swagger
 * /content/user/{userId}:
 *   get:
 *     summary: Get user's content
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: User content retrieved successfully
 */
contentRoute.get('/user/:userId', optionalAuth, getUserContent);

// Comment routes
/**
 * @swagger
 * /content/{contentId}/comments:
 *   get:
 *     summary: Get comments for a specific content
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of comments per page
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       404:
 *         description: Content not found
 */
contentRoute.get('/:contentId/comments', getComments);

/**
 * @swagger
 * /content/{contentId}/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Comment text
 *               parentComment:
 *                 type: string
 *                 description: Parent comment ID for replies (optional)
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Comment text is required
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Content not found
 */
contentRoute.post('/:contentId/comments', verifyToken, createComment);

/**
 * @swagger
 * /content/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Updated comment text
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: You can only update your own comments
 *       404:
 *         description: Comment not found
 */
contentRoute.put('/comments/:id', verifyToken, updateComment);

/**
 * @swagger
 * /content/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: You can only delete your own comments
 *       404:
 *         description: Comment not found
 */
contentRoute.delete('/comments/:id', verifyToken, deleteComment);

/**
 * @swagger
 * /content/comments/{commentId}/replies:
 *   get:
 *     summary: Get replies for a specific comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of replies per page
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
 *       404:
 *         description: Comment not found
 */
contentRoute.get('/comments/:commentId/replies', getReplies);

/**
 * @swagger
 * /content/comments/{id}/vote:
 *   post:
 *     summary: Vote on a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voteType:
 *                 type: string
 *                 enum: [upvote, downvote, remove]
 *                 description: Type of vote
 *     responses:
 *       200:
 *         description: Vote updated successfully
 *       400:
 *         description: Invalid vote type
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Comment not found
 */
contentRoute.post('/comments/:id/vote', verifyToken, voteComment);

export default contentRoute;
