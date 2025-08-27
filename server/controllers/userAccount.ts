import { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
import { AppError } from "../utils/errorHandler"
import User from "../models/User"
import { UserResponse } from "../utils/userResponse"
import { validateUserRegistration, validatePagination, isValidObjectId } from "../utils/validation"

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const { page, limit } = validatePagination(req.query.page as string, req.query.limit as string);
        const skip = (page - 1) * limit;

        const users = await User.find({}, '-_password -resetPasswordToken -resetPasswordExpires -emailVerificationToken')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers: total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return next(new AppError("Invalid user ID", 400));
        }

        const user = await User.findById(id, '-_password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        res.json({
            success: true,
            data: new UserResponse(user)
        });
    } catch (error) {
        next(error);
    }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        const authenticatedReq = req as any;
        if (!authenticatedReq.user) {
            return next(new AppError("Authentication required", 401));
        }

        const user = await User.findById(authenticatedReq.user.id, '-_password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        res.json({
            success: true,
            data: new UserResponse(user)
        });
    } catch (error) {
        next(error);
    }
}

export async function createAccount(req: Request, res: Response, next: NextFunction) {
    try {
        const { firstname, lastname, email, username, password, bio } = req.body;

        // Validate user registration data
        validateUserRegistration({ firstname, lastname, email, username, password });

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return next(new AppError("Email already registered", 409));
            }
            if (existingUser.username === username) {
                return next(new AppError("Username already taken", 409));
            }
        }

        // Create user with hashed password (handled by pre-save middleware)
        const userData = {
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            email: email.toLowerCase().trim(),
            username: username.trim(),
            _password: password,
            bio: bio?.trim() || ''
        };

        const user = await User.create(userData);

        // Return user data without password
        const userResponse = new UserResponse(user);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: userResponse
        });
    } catch (error) {
        next(error);
    }
}


export async function updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const authenticatedReq = req as any;
        if (!authenticatedReq.user) {
            return next(new AppError("Authentication required", 401));
        }

        const { firstname, lastname, bio, phone, facebook, dob, interests, avater } = req.body;

        const updateData: any = {};
        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (bio !== undefined) updateData.bio = bio;
        if (phone !== undefined) updateData.phone = phone;
        if (facebook !== undefined) updateData.facebook = facebook;
        if (dob) updateData.dob = new Date(dob);
        if (interests) updateData.interests = interests;
        if (avater) updateData.avater = avater;

        const updatedUser = await User.findByIdAndUpdate(
            authenticatedReq.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-_password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');

        if (!updatedUser) {
            return next(new AppError("User not found", 404));
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: new UserResponse(updatedUser)
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
        const authenticatedReq = req as any;
        if (!authenticatedReq.user) {
            return next(new AppError("Authentication required", 401));
        }

        const { password } = req.body;
        if (!password) {
            return next(new AppError("Password is required to delete account", 400));
        }

        // Verify password before deletion
        const user = await User.findById(authenticatedReq.user.id);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        const bcrypt = require('bcrypt');
        const isPasswordValid = await bcrypt.compare(password, user._password);
        if (!isPasswordValid) {
            return next(new AppError("Invalid password", 401));
        }

        // Delete user
        await User.findByIdAndDelete(authenticatedReq.user.id);

        res.json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
    try {
        const authenticatedReq = req as any;
        if (!authenticatedReq.user) {
            return next(new AppError("Authentication required", 401));
        }

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return next(new AppError("Both old and new passwords are required", 400));
        }

        if (newPassword.length < 6) {
            return next(new AppError("New password must be at least 6 characters long", 400));
        }

        // Get user with password
        const user = await User.findById(authenticatedReq.user.id).select('+_password');
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Verify old password
        const isOldPasswordValid = await user.comparePassword(oldPassword);
        if (!isOldPasswordValid) {
            return next(new AppError("Current password is incorrect", 400));
        }

        // Update password
        user._password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        next(error);
    }
}

export async function searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const authenticatedReq = req as any;
        if (!authenticatedReq.user) {
            return next(new AppError("Authentication required", 401));
        }

        const { q } = req.query;
        if (!q || typeof q !== 'string' || q.trim().length < 2) {
            return next(new AppError("Search query must be at least 2 characters long", 400));
        }

        const searchQuery = q.trim();

        // Search users by firstname, lastname, or username
        // Exclude the current user from results
        const users = await User.find({
            _id: { $ne: authenticatedReq.user.id },
            $or: [
                { firstname: { $regex: searchQuery, $options: 'i' } },
                { lastname: { $regex: searchQuery, $options: 'i' } },
                { username: { $regex: searchQuery, $options: 'i' } }
            ]
        }, '-_password -resetPasswordToken -resetPasswordExpires -emailVerificationToken')
            .limit(20) // Limit results to prevent large responses
            .sort({ firstname: 1, lastname: 1 });

        const userResponses = users.map(user => new UserResponse(user));

        res.json({
            success: true,
            data: userResponses
        });
    } catch (error) {
        next(error);
    }
}