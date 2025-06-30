import mongoose, { Schema, model, type CallbackError, type HydratedDocument } from "mongoose";
import bcrypt from "bcrypt"
import type { UserType } from "../utils/interfaces/User";

mongoose.Schema.Types.String.set('validate', (v: number | null) => v == null || v > 0)
const userSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    interests: { type: [String] },
    dob: Date,
    facebook: { type: String },
    phone: { type: String },
    avater: { type: String },
    _password: { type: String, required: true }
}, { timestamps: true })

const User = model('User', userSchema)

userSchema.pre('save', async function (this: HydratedDocument<UserType>, next) {
    const saltRounds = 10;
    try {
        if (!this.isModified("_password")) return next();
        const hash = await bcrypt.genSalt(saltRounds);
        this._password = await bcrypt.hash(this._password, hash)
        return next();
    } catch (err) {
        next(err as Error)
    }
})


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