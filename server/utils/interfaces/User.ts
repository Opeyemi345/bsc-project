// interfaces/User.ts

import type { JwtPayload } from "jsonwebtoken";

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