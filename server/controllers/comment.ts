import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/errorHandler";
import Content, { Comment } from "../models/Content";
import type { CustomRequest } from "../types/User";

// Get comments for a specific content
export async function getComments(req: Request, res: Response, next: NextFunction) {
    try {
        const { contentId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new AppError("Invalid content ID", 400));
        }

        // Check if content exists
        const content = await Content.findById(contentId);
        if (!content) {
            return next(new AppError("Content not found", 404));
        }

        const comments = await Comment.find({ 
            contentId, 
            parentComment: null // Only get top-level comments
        })
            .populate('userId', 'firstname lastname username avater')
            .populate({
                path: 'parentComment',
                populate: {
                    path: 'userId',
                    select: 'firstname lastname username avater'
                }
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({ parentComment: comment._id })
                    .populate('userId', 'firstname lastname username avater')
                    .sort({ createdAt: 1 })
                    .limit(5); // Limit replies shown initially

                return {
                    ...comment.toObject(),
                    replies,
                    replyCount: await Comment.countDocuments({ parentComment: comment._id })
                };
            })
        );

        const total = await Comment.countDocuments({ contentId, parentComment: null });
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: commentsWithReplies,
            pagination: {
                currentPage: page,
                totalPages,
                totalComments: total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
}

// Get replies for a specific comment
export async function getReplies(req: Request, res: Response, next: NextFunction) {
    try {
        const { commentId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return next(new AppError("Invalid comment ID", 400));
        }

        const replies = await Comment.find({ parentComment: commentId })
            .populate('userId', 'firstname lastname username avater')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 1 });

        const total = await Comment.countDocuments({ parentComment: commentId });
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: replies,
            pagination: {
                currentPage: page,
                totalPages,
                totalReplies: total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
}

// Create a new comment
export async function createComment(req: CustomRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new AppError("Authentication required", 401));
        }

        const { contentId } = req.params;
        const { comment, parentComment } = req.body;

        if (!comment || comment.trim().length === 0) {
            return next(new AppError("Comment text is required", 400));
        }

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new AppError("Invalid content ID", 400));
        }

        // Check if content exists
        const content = await Content.findById(contentId);
        if (!content) {
            return next(new AppError("Content not found", 404));
        }

        // If it's a reply, check if parent comment exists
        if (parentComment) {
            if (!mongoose.Types.ObjectId.isValid(parentComment)) {
                return next(new AppError("Invalid parent comment ID", 400));
            }

            const parentCommentDoc = await Comment.findById(parentComment);
            if (!parentCommentDoc) {
                return next(new AppError("Parent comment not found", 404));
            }

            // Ensure parent comment belongs to the same content
            if (parentCommentDoc.contentId.toString() !== contentId) {
                return next(new AppError("Parent comment does not belong to this content", 400));
            }
        }

        const commentData = {
            userId: req.user.id,
            contentId,
            comment: comment.trim(),
            parentComment: parentComment || null
        };

        const newComment = await Comment.create(commentData);
        
        // Add comment to content's comments array
        await Content.findByIdAndUpdate(contentId, {
            $push: { comments: newComment._id }
        });

        // Populate user data for response
        await newComment.populate('userId', 'firstname lastname username avater');

        res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: newComment
        });
    } catch (error) {
        next(error);
    }
}

// Update a comment
export async function updateComment(req: CustomRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new AppError("Authentication required", 401));
        }

        const { id } = req.params;
        const { comment } = req.body;

        if (!comment || comment.trim().length === 0) {
            return next(new AppError("Comment text is required", 400));
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError("Invalid comment ID", 400));
        }

        const existingComment = await Comment.findById(id);
        if (!existingComment) {
            return next(new AppError("Comment not found", 404));
        }

        // Check if user owns the comment
        if (existingComment.userId.toString() !== req.user.id.toString()) {
            return next(new AppError("You can only update your own comments", 403));
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            { comment: comment.trim() },
            { new: true, runValidators: true }
        ).populate('userId', 'firstname lastname username avater');

        res.json({
            success: true,
            message: "Comment updated successfully",
            data: updatedComment
        });
    } catch (error) {
        next(error);
    }
}

// Delete a comment
export async function deleteComment(req: CustomRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new AppError("Authentication required", 401));
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError("Invalid comment ID", 400));
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return next(new AppError("Comment not found", 404));
        }

        // Check if user owns the comment
        if (comment.userId.toString() !== req.user.id.toString()) {
            return next(new AppError("You can only delete your own comments", 403));
        }

        // Delete all replies to this comment
        await Comment.deleteMany({ parentComment: id });

        // Remove comment from content's comments array
        await Content.findByIdAndUpdate(comment.contentId, {
            $pull: { comments: id }
        });

        // Delete the comment
        await Comment.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

// Vote on a comment
export async function voteComment(req: CustomRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
            return next(new AppError("Authentication required", 401));
        }

        const { id } = req.params;
        const { voteType } = req.body; // 'upvote', 'downvote', or 'remove'

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError("Invalid comment ID", 400));
        }

        if (!['upvote', 'downvote', 'remove'].includes(voteType)) {
            return next(new AppError("Invalid vote type", 400));
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            return next(new AppError("Comment not found", 404));
        }

        const userId = req.user.id;
        const hasUpvoted = comment.upvotedBy.includes(userId);
        const hasDownvoted = comment.downvotedBy.includes(userId);

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

        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true }
        );

        res.json({
            success: true,
            message: "Vote updated successfully",
            data: {
                upvotes: updatedComment?.upvotes,
                downvotes: updatedComment?.downvotes,
                userVote: hasUpvoted ? 'upvote' : hasDownvoted ? 'downvote' : null
            }
        });
    } catch (error) {
        next(error);
    }
}
