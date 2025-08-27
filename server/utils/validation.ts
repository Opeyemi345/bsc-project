import { AppError } from "./errorHandler";

// Email validation
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
};

// Username validation
export const isValidUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Validate required fields
export const validateRequiredFields = (data: any, requiredFields: string[]): void => {
    const missingFields = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
        throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }
};

// Validate user registration data
export const validateUserRegistration = (userData: {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
}): void => {
    const { firstname, lastname, username, email, password } = userData;

    // Check required fields
    validateRequiredFields(userData, ['firstname', 'lastname', 'username', 'email', 'password']);

    // Validate email format
    if (!isValidEmail(email)) {
        throw new AppError('Please provide a valid email address', 400);
    }

    // Validate password strength
    if (!isValidPassword(password)) {
        throw new AppError('Password must be at least 6 characters long', 400);
    }

    // Validate username format
    if (!isValidUsername(username)) {
        throw new AppError('Username must be 3-20 characters long and contain only letters, numbers, and underscores', 400);
    }

    // Validate name lengths
    if (firstname.trim().length < 2 || firstname.trim().length > 50) {
        throw new AppError('First name must be between 2 and 50 characters', 400);
    }

    if (lastname.trim().length < 2 || lastname.trim().length > 50) {
        throw new AppError('Last name must be between 2 and 50 characters', 400);
    }
};

// Validate content creation data
export const validateContentCreation = (contentData: {
    title: string;
    content: string;
    tags?: string[];
}): void => {
    const { title, content, tags } = contentData;

    // Check required fields
    validateRequiredFields(contentData, ['title', 'content']);

    // Validate title length
    if (title.trim().length < 5 || title.trim().length > 200) {
        throw new AppError('Title must be between 5 and 200 characters', 400);
    }

    // Validate content length
    if (content.trim().length < 10 || content.trim().length > 10000) {
        throw new AppError('Content must be between 10 and 10,000 characters', 400);
    }

    // Validate tags
    if (tags && tags.length > 10) {
        throw new AppError('Maximum 10 tags allowed', 400);
    }

    if (tags) {
        for (const tag of tags) {
            if (tag.length > 30) {
                throw new AppError('Each tag must be 30 characters or less', 400);
            }
        }
    }
};

// Validate community creation data
export const validateCommunityCreation = (communityData: {
    name: string;
    description: string;
    rules?: string[];
    tags?: string[];
}): void => {
    const { name, description, rules, tags } = communityData;

    // Check required fields
    validateRequiredFields(communityData, ['name', 'description']);

    // Validate name length
    if (name.trim().length < 3 || name.trim().length > 50) {
        throw new AppError('Community name must be between 3 and 50 characters', 400);
    }

    // Validate description length
    if (description.trim().length < 10 || description.trim().length > 500) {
        throw new AppError('Community description must be between 10 and 500 characters', 400);
    }

    // Validate rules
    if (rules && rules.length > 20) {
        throw new AppError('Maximum 20 rules allowed', 400);
    }

    if (rules) {
        for (const rule of rules) {
            if (rule.length > 200) {
                throw new AppError('Each rule must be 200 characters or less', 400);
            }
        }
    }

    // Validate tags
    if (tags && tags.length > 10) {
        throw new AppError('Maximum 10 tags allowed', 400);
    }

    if (tags) {
        for (const tag of tags) {
            if (tag.length > 30) {
                throw new AppError('Each tag must be 30 characters or less', 400);
            }
        }
    }
};

// Validate comment data
export const validateComment = (comment: string): void => {
    if (!comment || comment.trim().length === 0) {
        throw new AppError('Comment cannot be empty', 400);
    }

    if (comment.trim().length > 1000) {
        throw new AppError('Comment must be 1000 characters or less', 400);
    }
};

// Validate pagination parameters
export const validatePagination = (page?: string, limit?: string): { page: number; limit: number } => {
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '10');

    if (isNaN(pageNum) || pageNum < 1) {
        throw new AppError('Page must be a positive integer', 400);
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new AppError('Limit must be between 1 and 100', 400);
    }

    return { page: pageNum, limit: limitNum };
};

// Validate MongoDB ObjectId
export const isValidObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

// Rate limiting helper
export const createRateLimitKey = (ip: string, endpoint: string): string => {
    return `rate_limit:${ip}:${endpoint}`;
};

// File validation
export const validateFileUpload = (file: any, allowedTypes: string[], maxSize: number): void => {
    if (!file) {
        throw new AppError('No file provided', 400);
    }

    if (!allowedTypes.includes(file.mimetype)) {
        throw new AppError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400);
    }

    if (file.size > maxSize) {
        throw new AppError(`File size too large. Maximum size: ${maxSize / 1024 / 1024}MB`, 400);
    }
};
