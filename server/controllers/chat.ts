import { Request, Response, NextFunction } from "express";
import Chat, { Message } from "../models/Chat";
import { AppError } from "../utils/errorHandler";
import mongoose from "mongoose";

// Get all chats for a user
export const getUserChats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        const chats = await Chat.find({
            participants: userId,
            isActive: true
        })
            .populate('participants', 'firstname lastname username avater')
            .populate('lastMessage.senderId', 'firstname lastname username')
            .sort({ 'lastMessage.timestamp': -1 });

        res.json({
            success: true,
            data: chats
        });
    } catch (error) {
        next(error);
    }
};

// Create a new chat (direct or group)
export const createChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { participantIds, chatType = 'direct', chatName, chatDescription } = req.body;
        const currentUserId = (req as any).user.id;

        if (!participantIds || !Array.isArray(participantIds)) {
            return next(new AppError("Participant IDs must be an array", 400));
        }

        // For direct chats, ensure exactly 1 other participant
        if (chatType === 'direct') {
            if (participantIds.length !== 1) {
                return next(new AppError("Direct chats must have exactly one other participant", 400));
            }
        }

        // For group chats, allow empty participant arrays (creator will be the only member initially)
        if (chatType === 'group' && participantIds.length === 0) {
            // This is fine, group can start with just the creator
        }

        // Add current user to participants
        const allParticipants = [currentUserId, ...participantIds];

        // Check if direct chat already exists
        if (chatType === 'direct') {
            const existingChat = await Chat.findOne({
                chatType: 'direct',
                participants: { $all: allParticipants, $size: 2 }
            });

            if (existingChat) {
                res.json({
                    success: true,
                    data: existingChat,
                    message: "Chat already exists"
                });
                return;
            }
        }

        const chatData: any = {
            participants: allParticipants,
            chatType,
            createdBy: currentUserId
        };

        if (chatType === 'group') {
            if (!chatName) {
                return next(new AppError("Group chat name is required", 400));
            }
            chatData.chatName = chatName;
            chatData.chatDescription = chatDescription;
            chatData.adminUsers = [currentUserId];
        }

        const newChat = await Chat.create(chatData);

        const populatedChat = await Chat.findById(newChat._id)
            .populate('participants', 'firstname lastname username avater')
            .populate('createdBy', 'firstname lastname username');

        res.status(201).json({
            success: true,
            data: populatedChat,
            message: "Chat created successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Get chat by ID with messages
export const getChatById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { chatId } = req.params;
        const userId = (req as any).user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        // Verify user is participant in the chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        }).populate('participants', 'firstname lastname username avater');

        if (!chat) {
            return next(new AppError("Chat not found or access denied", 404));
        }

        // Get messages for this chat
        const messages = await Message.find({
            chatId: chatId,
            isDeleted: false
        })
            .populate('senderId', 'firstname lastname username avater')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMessages = await Message.countDocuments({
            chatId: chatId,
            isDeleted: false
        });

        res.json({
            success: true,
            data: {
                chat,
                messages: messages.reverse(), // Reverse to show oldest first
                pagination: {
                    page,
                    limit,
                    total: totalMessages,
                    pages: Math.ceil(totalMessages / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Send a message
export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { chatId } = req.params;
        const { content, messageType = 'text', fileUrl, fileName } = req.body;
        const senderId = (req as any).user.id;

        if (!content && !fileUrl) {
            return next(new AppError("Message content or file is required", 400));
        }

        // Verify user is participant in the chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: senderId
        });

        if (!chat) {
            return next(new AppError("Chat not found or access denied", 404));
        }

        const messageData = {
            chatId,
            senderId,
            content: content || '',
            messageType,
            fileUrl,
            fileName
        };

        const newMessage = await Message.create(messageData);

        // Update chat's last message
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: {
                content: content || `Sent a ${messageType}`,
                senderId,
                timestamp: new Date()
            }
        });

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'firstname lastname username avater');

        res.status(201).json({
            success: true,
            data: populatedMessage,
            message: "Message sent successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Mark messages as read
export const markMessagesAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { chatId } = req.params;
        const userId = (req as any).user.id;

        // Verify user is participant in the chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        });

        if (!chat) {
            return next(new AppError("Chat not found or access denied", 404));
        }

        // Mark all unread messages in this chat as read by this user
        await Message.updateMany(
            {
                chatId: chatId,
                senderId: { $ne: userId }, // Don't mark own messages
                'readBy.userId': { $ne: userId } // Not already read by this user
            },
            {
                $push: {
                    readBy: {
                        userId: userId,
                        readAt: new Date()
                    }
                }
            }
        );

        res.json({
            success: true,
            message: "Messages marked as read"
        });
    } catch (error) {
        next(error);
    }
};

// Delete a message
export const deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { messageId } = req.params;
        const userId = (req as any).user.id;

        const message = await Message.findById(messageId);
        if (!message) {
            return next(new AppError("Message not found", 404));
        }

        // Only sender can delete their message
        if (message.senderId.toString() !== userId.toString()) {
            return next(new AppError("You can only delete your own messages", 403));
        }

        await Message.findByIdAndUpdate(messageId, {
            isDeleted: true,
            content: "This message was deleted"
        });

        res.json({
            success: true,
            message: "Message deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Add members to group chat
export const addMembersToGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { chatId } = req.params;
        const { userIds } = req.body;
        const currentUserId = (req as any).user.id;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return next(new AppError("User IDs must be a non-empty array", 400));
        }

        // Find the chat and verify it's a group chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return next(new AppError("Chat not found", 404));
        }

        if (chat.chatType !== 'group') {
            return next(new AppError("Can only add members to group chats", 400));
        }

        // Check if current user is admin or creator
        const isAdmin = chat.adminUsers.includes(currentUserId) || chat.createdBy.toString() === currentUserId;
        if (!isAdmin) {
            return next(new AppError("Only admins can add members to the group", 403));
        }

        // Filter out users who are already members
        const newMembers = userIds.filter(userId => !chat.participants.includes(userId));

        if (newMembers.length === 0) {
            return next(new AppError("All specified users are already members", 400));
        }

        // Add new members to the chat
        chat.participants.push(...newMembers);
        await chat.save();

        // Populate the updated chat
        const updatedChat = await Chat.findById(chatId)
            .populate('participants', 'firstname lastname username avater')
            .populate('adminUsers', 'firstname lastname username')
            .populate('createdBy', 'firstname lastname username');

        res.json({
            success: true,
            data: updatedChat,
            message: `${newMembers.length} member(s) added successfully`
        });
    } catch (error) {
        next(error);
    }
};

// Remove member from group chat
export const removeMemberFromGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { chatId, userId } = req.params;
        const currentUserId = (req as any).user.id;

        // Find the chat and verify it's a group chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return next(new AppError("Chat not found", 404));
        }

        if (chat.chatType !== 'group') {
            return next(new AppError("Can only remove members from group chats", 400));
        }

        // Check if user to remove is actually a member
        if (!chat.participants.includes(userId)) {
            return next(new AppError("User is not a member of this group", 400));
        }

        // Check permissions: admins can remove anyone, users can remove themselves
        const isAdmin = chat.adminUsers.includes(currentUserId) || chat.createdBy.toString() === currentUserId;
        const isSelfRemoval = currentUserId === userId;

        if (!isAdmin && !isSelfRemoval) {
            return next(new AppError("You can only remove yourself or be an admin to remove others", 403));
        }

        // Cannot remove the creator
        if (chat.createdBy.toString() === userId) {
            return next(new AppError("Cannot remove the group creator", 403));
        }

        // Remove the user from participants and admin lists
        chat.participants = chat.participants.filter(id => id.toString() !== userId);
        chat.adminUsers = chat.adminUsers.filter(id => id.toString() !== userId);
        await chat.save();

        // Populate the updated chat
        const updatedChat = await Chat.findById(chatId)
            .populate('participants', 'firstname lastname username avater')
            .populate('adminUsers', 'firstname lastname username')
            .populate('createdBy', 'firstname lastname username');

        res.json({
            success: true,
            data: updatedChat,
            message: "Member removed successfully"
        });
    } catch (error) {
        next(error);
    }
};
