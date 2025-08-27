import { Request, Response, NextFunction } from "express";
import Content, { Comment } from "../models/Content";
import { AppError } from "../utils/errorHandler";
import { CustomRequest } from "../types/User";

// Get all content/posts
export const getAllContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const content = await Content.find()
            .populate('userId', 'firstname lastname username avater')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Content.countDocuments();

        res.json({
            success: true,
            data: content,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get content by ID
export const getContentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const content = await Content.findById(id)
            .populate('userId', 'firstname lastname username avater');

        if (!content) {
            return next(new AppError("Content not found", 404));
        }

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        next(error);
    }
};

// Create new content/post
export const createContent = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { title, content, media, tags, communityId, isPublic } = req.body;

        if (!title || !content) {
            return next(new AppError("Title and content are required", 400));
        }

        const newContent = await Content.create({
            userId: req.user.id,
            title,
            content,
            media: media || [],
            tags: tags || [],
            communityId,
            isPublic: isPublic !== undefined ? isPublic : true
        });

        const populatedContent = await Content.findById(newContent._id)
            .populate('userId', 'firstname lastname username avater')
            .populate('communityId', 'name');

        res.status(201).json({
            success: true,
            message: "Content created successfully",
            data: populatedContent
        });
    } catch (error) {
        next(error);
    }
};

// Update content
export const updateContent = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, content, media, tags, isPublic } = req.body;

        const existingContent = await Content.findById(id);
        if (!existingContent) {
            return next(new AppError("Content not found", 404));
        }

        // Check if user owns the content
        if (existingContent.userId.toString() !== req.user.id.toString()) {
            return next(new AppError("You can only update your own content", 403));
        }

        const updatedContent = await Content.findByIdAndUpdate(
            id,
            { title, content, media, tags, isPublic },
            { new: true, runValidators: true }
        ).populate('userId', 'firstname lastname username avater')
            .populate('communityId', 'name');

        res.json({
            success: true,
            message: "Content updated successfully",
            data: updatedContent
        });
    } catch (error) {
        next(error);
    }
};

// Delete content
export const deleteContent = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const content = await Content.findById(id);
        if (!content) {
            return next(new AppError("Content not found", 404));
        }

        // Check if user owns the content
        if (content.userId.toString() !== req.user.id.toString()) {
            return next(new AppError("You can only delete your own content", 403));
        }

        await Content.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Content deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Vote on content (upvote, downvote, or remove vote)
export const voteContent = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { voteType } = req.body; // 'upvote', 'downvote', or 'remove'
        const userId = req.user.id;

        if (!['upvote', 'downvote', 'remove'].includes(voteType)) {
            return next(new AppError("Invalid vote type", 400));
        }

        const content = await Content.findById(id);
        if (!content) {
            return next(new AppError("Content not found", 404));
        }

        // Check current user vote status
        const hasUpvoted = content.upvotedBy?.includes(userId) || false;
        const hasDownvoted = content.downvotedBy?.includes(userId) || false;

        let updateQuery: any = {};

        if (voteType === 'upvote') {
            if (hasUpvoted) {
                // Remove upvote
                updateQuery = {
                    $pull: { upvotedBy: userId },
                    $inc: { upvotes: -1 }
                };
            } else {
                // Add upvote, remove downvote if exists
                updateQuery = {
                    $addToSet: { upvotedBy: userId },
                    $pull: { downvotedBy: userId },
                    $inc: { upvotes: 1, downvotes: hasDownvoted ? -1 : 0 }
                };
            }
        } else if (voteType === 'downvote') {
            if (hasDownvoted) {
                // Remove downvote
                updateQuery = {
                    $pull: { downvotedBy: userId },
                    $inc: { downvotes: -1 }
                };
            } else {
                // Add downvote, remove upvote if exists
                updateQuery = {
                    $addToSet: { downvotedBy: userId },
                    $pull: { upvotedBy: userId },
                    $inc: { downvotes: 1, upvotes: hasUpvoted ? -1 : 0 }
                };
            }
        } else if (voteType === 'remove') {
            // Remove both votes
            updateQuery = {
                $pull: { upvotedBy: userId, downvotedBy: userId },
                $inc: {
                    upvotes: hasUpvoted ? -1 : 0,
                    downvotes: hasDownvoted ? -1 : 0
                }
            };
        }

        const updatedContent = await Content.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        ).populate('userId', 'firstname lastname username avater');

        res.json({
            success: true,
            message: "Vote updated successfully",
            data: {
                upvotes: updatedContent?.upvotes,
                downvotes: updatedContent?.downvotes,
                userVote: hasUpvoted ? 'upvote' : hasDownvoted ? 'downvote' : null
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get user's content
export const getUserContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const content = await Content.find({ userId })
            .populate('userId', 'firstname lastname username avater')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Content.countDocuments({ userId });

        res.json({
            success: true,
            data: content,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};
