import { Router } from "express";
import {
    getAllCommunities,
    getCommunityById,
    createCommunity,
    updateCommunity,
    joinCommunity,
    leaveCommunity,
    getUserCommunities,
    deleteCommunity
} from "../controllers/community";
import { verifyToken, optionalAuth } from "../controllers/auth";

const communityRoute = Router();

/**
 * @swagger
 * /communities:
 *   get:
 *     summary: Get all communities
 *     tags: [Communities]
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
 *         description: Number of communities per page
 *     responses:
 *       200:
 *         description: Communities retrieved successfully
 */
communityRoute.get('/', optionalAuth, getAllCommunities);

/**
 * @swagger
 * /communities/my:
 *   get:
 *     summary: Get user's communities
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User communities retrieved successfully
 *       401:
 *         description: Authentication required
 */
communityRoute.get('/my', verifyToken, getUserCommunities);

/**
 * @swagger
 * /communities/{id}:
 *   get:
 *     summary: Get community by ID
 *     tags: [Communities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Community ID
 *     responses:
 *       200:
 *         description: Community retrieved successfully
 *       404:
 *         description: Community not found
 */
communityRoute.get('/:id', optionalAuth, getCommunityById);

/**
 * @swagger
 * /communities:
 *   post:
 *     summary: Create a new community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Community name
 *               description:
 *                 type: string
 *                 description: Community description
 *               category:
 *                 type: string
 *                 description: Community category
 *               isPrivate:
 *                 type: boolean
 *                 description: Whether the community is private
 *               rules:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Community rules
 *     responses:
 *       201:
 *         description: Community created successfully
 *       400:
 *         description: Community name is required
 *       409:
 *         description: Community with this name already exists
 */
communityRoute.post('/', verifyToken, createCommunity);

/**
 * @swagger
 * /communities/{id}:
 *   put:
 *     summary: Update community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Community ID
 *     responses:
 *       200:
 *         description: Community updated successfully
 *       403:
 *         description: Only the community organizer can update the community
 *       404:
 *         description: Community not found
 */
communityRoute.put('/:id', verifyToken, updateCommunity);

/**
 * @swagger
 * /communities/{id}/join:
 *   post:
 *     summary: Join a community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Community ID
 *     responses:
 *       200:
 *         description: Successfully joined the community
 *       400:
 *         description: You are already a member of this community
 *       404:
 *         description: Community not found
 */
communityRoute.post('/:id/join', verifyToken, joinCommunity);

/**
 * @swagger
 * /communities/{id}/leave:
 *   post:
 *     summary: Leave a community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Community ID
 *     responses:
 *       200:
 *         description: Successfully left the community
 *       400:
 *         description: You are not a member of this community or organizer cannot leave
 *       404:
 *         description: Community not found
 */
communityRoute.post('/:id/leave', verifyToken, leaveCommunity);

/**
 * @swagger
 * /communities/{id}:
 *   delete:
 *     summary: Delete community
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Community ID
 *     responses:
 *       200:
 *         description: Community deleted successfully
 *       403:
 *         description: Only the community organizer can delete the community
 *       404:
 *         description: Community not found
 */
communityRoute.delete('/:id', verifyToken, deleteCommunity);

export default communityRoute;
