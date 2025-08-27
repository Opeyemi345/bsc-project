// import type { HydratedDocument } from "mongoose";
import type { UserType } from "../types/User";

export class UserResponse {
    id?: string;
    firstname?: string;
    lastname?: string;
    username?: string;
    email?: string;
    bio?: string;
    interests?: string[];
    dob?: Date;
    facebook?: string;
    phone?: string;
    avater?: string;

    constructor(user: any) {
        this.id = user._id?.toString() || user.id;
        this.firstname = user.firstname
        this.lastname = user.lastname
        this.username = user.username
        this.email = user.email
        this.bio = user.bio;
        this.interests = user.interests;
        this.dob = user.dob;
        this.facebook = user.facebook;
        this.phone = user.phone;
        this.avater = user.avater
    }
}