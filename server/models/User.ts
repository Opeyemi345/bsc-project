import mongoose, { Schema, model, type CallbackError, type HydratedDocument } from "mongoose";
import bcrypt from "bcrypt"
import type { UserType } from "../types/User";

// Removed problematic global string validator
const userSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    email_verified: { type: Boolean, default: false },
    bio: { type: String },
    interests: { type: [String] },
    dob: Date,
    facebook: { type: String },
    phone: { type: String },
    avater: { type: String },
    _password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    emailVerificationToken: { type: String }
}, { timestamps: true })

userSchema.pre('save', async function (this: HydratedDocument<UserType>, next) {
    const saltRounds = 10;
    try {
        if (!this.isModified("_password")) return next();
        const salt = await bcrypt.genSalt(saltRounds);
        this._password = await bcrypt.hash(this._password, salt)
        return next();
    } catch (err) {
        next(err as Error)
    }
})

// Add comparePassword method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this._password);
    } catch (error) {
        throw error;
    }
};

const User = model('User', userSchema)


try {
    User.init()
} catch (err) {
    if (err instanceof Error) {
        console.error(err.message)
    } else {
        console.error(err);
    }
}

export default User;