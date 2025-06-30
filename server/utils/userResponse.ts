// import type { HydratedDocument } from "mongoose";
import type { UserType } from "./interfaces/User";

export class UserResponse {
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

    constructor(user: UserType) {
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