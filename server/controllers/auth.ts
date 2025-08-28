import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { AppError } from "../utils/errorHandler"
import User from "../models/User"
import bcrypt from "bcrypt";
import { CustomRequest, JwtUserPayload } from "../types/User";
import crypto from "crypto";
import { emailService } from "../services/emailService";

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return next(new AppError("Username and password are required", 400));
        }

        const user = await User.findOne({
            $or: [{ username: username }, { email: username }]
        });

        if (!user) {
            return next(new AppError("Invalid login credentials", 401));
        }

        const isPasswordValid = await bcrypt.compare(password, user._password);
        if (!isPasswordValid) {
            return next(new AppError("Invalid login credentials", 401));
        }

        const { _id, firstname, lastname, email, bio, avater } = user;
        const token = jwt.sign(
            { id: _id, firstname, lastname, username: user.username, email, bio },
            process.env.SERVER_SECRET || 'randomsecret',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            data: {
                id: _id,
                token,
                firstname,
                lastname,
                username: user.username,
                email,
                bio,
                avatar: avater
            }
        });
    } catch (error) {
        next(error);
    }
}

// Legacy token function for backward compatibility
export const token = login;

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(new AppError("Email is required", 400));
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists or not for security
            res.status(200).json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent."
            });
            return;
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Store reset token in user document (you might want to add these fields to User schema)
        await User.findByIdAndUpdate(user._id, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetTokenExpiry
        });

        // Send password reset email
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;
        const userName = `${user.firstname} ${user.lastname}`;

        await emailService.sendPasswordResetEmail(email, userName, resetUrl);

        res.status(200).json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent."
        });
    } catch (error) {
        next(error);
    }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return next(new AppError("New password is required", 400));
        }

        if (newPassword.length < 6) {
            return next(new AppError("Password must be at least 6 characters long", 400));
        }

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return next(new AppError("Invalid or expired reset token", 400));
        }

        // Update password
        user._password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        next(error);
    }
}

export const requestEmailVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(new AppError("Email is required", 400));
        }

        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        if (user.email_verified) {
            res.status(200).json({
                success: true,
                message: "Email is already verified"
            });
            return;
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Store verification token
        await User.findByIdAndUpdate(user._id, {
            emailVerificationToken: verificationToken
        });

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email/${verificationToken}`;
        const userName = `${user.firstname} ${user.lastname}`;

        await emailService.sendEmailVerification(email, userName, verificationUrl);

        res.status(200).json({
            success: true,
            message: "Verification email sent"
        });
    } catch (error) {
        next(error);
    }
}

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ emailVerificationToken: token });
        if (!user) {
            return next(new AppError("Invalid verification token", 400));
        }

        // Update user as verified
        await User.findByIdAndUpdate(user._id, {
            email_verified: true,
            emailVerificationToken: undefined
        });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        next(error);
    }
}

// JWT Verification Middleware
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError("Access token is required", 401));
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        const decoded = jwt.verify(token, process.env.SERVER_SECRET || 'randomsecret') as JwtUserPayload;

        // Get fresh user data
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new AppError("User not found", 401));
        }

        // Attach user to request (using type assertion)
        (req as any).user = {
            id: String(user._id), // Ensure ID is a string
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            bio: user.bio,
            avatar: user.avater,
            token: token
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError("Invalid token", 401));
        }
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError("Token expired", 401));
        }
        next(error);
    }
}

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // Continue without authentication
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.SERVER_SECRET || 'randomsecret') as JwtUserPayload;

        const user = await User.findById(decoded.id);
        if (user) {
            (req as any).user = {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                bio: user.bio,
                avatar: user.avater,
                token: token
            };
        }

        next();
    } catch (error) {
        // Ignore token errors in optional auth
        next();
    }
}