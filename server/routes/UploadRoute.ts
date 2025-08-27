import { Router } from "express";
import {
    uploadSingle,
    uploadMultiple,
    uploadFields,
    deleteFile,
    getOptimizedFileUrl
} from "../controllers/upload";
import { verifyToken } from "../controllers/auth";

const uploadRoute = Router();

// All upload routes require authentication
uploadRoute.use(verifyToken);

/**
 * @swagger
 * /upload/single:
 *   post:
 *     summary: Upload a single file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
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
 *                     url:
 *                       type: string
 *                     publicId:
 *                       type: string
 *                     originalName:
 *                       type: string
 *                     size:
 *                       type: number
 *                     mimetype:
 *                       type: string
 *                     optimizedUrl:
 *                       type: string
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Authentication required
 */
uploadRoute.post('/single', uploadSingle('file'));

/**
 * @swagger
 * /upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (max 5)
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       400:
 *         description: No files uploaded or invalid file type
 *       401:
 *         description: Authentication required
 */
uploadRoute.post('/multiple', uploadMultiple('files', 5));

/**
 * @swagger
 * /upload/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Authentication required
 */
uploadRoute.post('/avatar', uploadSingle('avatar'));

/**
 * @swagger
 * /upload/post-media:
 *   post:
 *     summary: Upload media for posts
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Video files
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Document files
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 *       400:
 *         description: No files uploaded or invalid file type
 *       401:
 *         description: Authentication required
 */
uploadRoute.post('/post-media', uploadFields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 },
    { name: 'documents', maxCount: 3 }
]));

/**
 * @swagger
 * /upload/delete/{publicId}:
 *   delete:
 *     summary: Delete a file from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: Public ID is required
 *       401:
 *         description: Authentication required
 *       404:
 *         description: File not found
 */
uploadRoute.delete('/delete/:publicId', deleteFile);

/**
 * @swagger
 * /upload/optimize/{publicId}:
 *   get:
 *     summary: Get optimized URL for a file
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID of the file
 *       - in: query
 *         name: width
 *         schema:
 *           type: integer
 *         description: Desired width
 *       - in: query
 *         name: height
 *         schema:
 *           type: integer
 *         description: Desired height
 *       - in: query
 *         name: quality
 *         schema:
 *           type: string
 *         description: Quality setting (auto, auto:good, auto:best, etc.)
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *         description: Output format (jpg, png, webp, etc.)
 *     responses:
 *       200:
 *         description: Optimized URL generated successfully
 *       400:
 *         description: Public ID is required
 */
uploadRoute.get('/optimize/:publicId', getOptimizedFileUrl);

/**
 * @swagger
 * /upload/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Authentication required
 */
uploadRoute.post('/avatar', verifyToken, uploadSingle('avatar'));

export default uploadRoute;
