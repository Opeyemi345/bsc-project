import { Request, Response, NextFunction } from "express";
import Community from "../models/Community";
import { AppError } from "../utils/errorHandler";
import { CustomRequest } from "../types/User";

// Get all communities
export const getAllCommunities = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const communities = await Community.find({ isActive: true })
            .populate('organizer', 'firstname lastname username avater')
            .populate('members', 'firstname lastname username avater')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Community.countDocuments({ isActive: true });

        res.json({
            success: true,
            data: communities,
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

// Get community by ID
export const getCommunityById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const community = await Community.findById(id)
            .populate('organizer', 'firstname lastname username avater')
            .populate('members', 'firstname lastname username avater');

        if (!community) {
            return next(new AppError("Community not found", 404));
        }

        res.json({
            success: true,
            data: community
        });
    } catch (error) {
        next(error);
    }
};

// Create new community
export const createCommunity = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { name, description, category, isPrivate, rules } = req.body;
        const organizerId = req.user.id;

        if (!name) {
            return next(new AppError("Community name is required", 400));
        }

        // Check if community with same name already exists
        const existingCommunity = await Community.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingCommunity) {
            return next(new AppError("A community with this name already exists", 409));
        }

        const communityData = {
            name,
            description: description || '',
            category: category || 'General',
            organizer: organizerId,
            members: [organizerId], // Creator is automatically a member
            isPrivate: isPrivate || false,
            rules: rules || []
        };

        const newCommunity = await Community.create(communityData);

        const populatedCommunity = await Community.findById(newCommunity._id)
            .populate('organizer', 'firstname lastname username avater')
            .populate('members', 'firstname lastname username avater');

        res.status(201).json({
            success: true,
            data: populatedCommunity,
            message: "Community created successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Update community
export const updateCommunity = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, description, category, isPrivate, rules } = req.body;
        const userId = req.user.id;

        const community = await Community.findById(id);
        if (!community) {
            return next(new AppError("Community not found", 404));
        }

        // Check if user is the organizer
        if (community.organizer.toString() !== userId.toString()) {
            return next(new AppError("Only the community organizer can update the community", 403));
        }

        const updatedCommunity = await Community.findByIdAndUpdate(
            id,
            { name, description, category, isPrivate, rules },
            { new: true, runValidators: true }
        )
            .populate('organizer', 'firstname lastname username avater')
            .populate('members', 'firstname lastname username avater');

        res.json({
            success: true,
            data: updatedCommunity,
            message: "Community updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Join community
export const joinCommunity = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const community = await Community.findById(id);
        if (!community) {
            return next(new AppError("Community not found", 404));
        }

        // Check if user is already a member
        if (community.members.includes(userId)) {
            return next(new AppError("You are already a member of this community", 400));
        }

        // Add user to members
        community.members.push(userId);
        community.memberCount = community.members.length;
        await community.save();

        const updatedCommunity = await Community.findById(id)
            .populate('organizer', 'firstname lastname username avater')
            .populate('members', 'firstname lastname username avater');

        res.json({
            success: true,
            data: updatedCommunity,
            message: "Successfully joined the community"
        });
    } catch (error) {
        next(error);
    }
};

// Leave community
export const leaveCommunity = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const community = await Community.findById(id);
        if (!community) {
            return next(new AppError("Community not found", 404));
        }

        // Check if user is a member
        if (!community.members.includes(userId)) {
            return next(new AppError("You are not a member of this community", 400));
        }

        // Organizer cannot leave their own community
        if (community.organizer.toString() === userId.toString()) {
            return next(new AppError("Community organizer cannot leave the community", 400));
        }

        // Remove user from members
        community.members = community.members.filter(memberId => memberId.toString() !== userId.toString());
        community.memberCount = community.members.length;
        await community.save();

        res.json({
            success: true,
            message: "Successfully left the community"
        });
    } catch (error) {
        next(error);
    }
};

// Get user's communities
export const getUserCommunities = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;

        const communities = await Community.find({
            members: userId,
            isActive: true
        })
            .populate('organizer', 'firstname lastname username avater')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: communities
        });
    } catch (error) {
        next(error);
    }
};

// Delete community (organizer only)
export const deleteCommunity = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const community = await Community.findById(id);
        if (!community) {
            return next(new AppError("Community not found", 404));
        }

        // Check if user is the organizer
        if (community.organizer.toString() !== userId.toString()) {
            return next(new AppError("Only the community organizer can delete the community", 403));
        }

        // Soft delete - mark as inactive
        await Community.findByIdAndUpdate(id, { isActive: false });

        res.json({
            success: true,
            message: "Community deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
