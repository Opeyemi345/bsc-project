// interfaces/User.ts
import { Request } from "express";

import type { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongoose";

export interface UserType {
    id: string,
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    bio?: string;
    interests?: string[];
    dob?: Date;
    facebook?: string;
    phone?: string;
    avater?: string;
    _password: string;
}

export interface JwtUserPayload extends JwtPayload {
    id: string;
}

export interface AuthenticatedUser {
    id: ObjectId,
    firstname: string,
    lastname: string,
    email: string,
    bio?: string,
    avatar?: string,
    token: string
}

export interface CustomRequest<T = any> extends Request {
    user: AuthenticatedUser,
    body: T
}