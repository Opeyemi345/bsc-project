import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { AppError } from "../utils/errorHandler"
import User from "../models/User"
import bcrypt from "bcrypt";


export const token = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body
    if (!username || !password) return next(new AppError("Username and password cannot be null", 400))
    const user = await User.findOne({ $or: [{ username: username }, { email: username }] });
    if (!user) return next(new AppError("User with username doesn't exist", 404))
    const { id, firstname, lastname, email, bio } = user
    if (await bcrypt.compare(password, user._password)) {
        const token = jwt.sign({ data: { id, firstname, lastname, username, email, bio } }, process.env.SERVER_SECRET || 'randomsecret', { expiresIn: 2 * 60 * 60 })
        res.status(201).json({ data: { id, token, firstname, lastname, username, email, bio } })
    }
    return res.status(400).json({ message: "Incorrect login details" })
}

export const requestPasswordReset = async () => {

}

export const resetPassword = async () => {

}