import type { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import { AppError } from "../utils/errorHandler.ts"
import User from "../models/User.ts"
import type { UserType, JwtUserPayload } from "../utils/interfaces/User.ts"


export async function getAllUser(req: Request, res: Response) {
    return res.json({ data: User.find({}) })
}

export async function getAuthenticatedUser(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) return next(new AppError(`Invalid`, 401))
    const token = req.headers.authorization.split(' ')[1]
    try {
        const { id } = jwt.verify(token, process.env.SERVER_SECRET || 'randomsecret') as JwtUserPayload;
        return res.json({ data: await User.findById(id) })
    } catch (err) {
        return next(err)
    }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params
    const user = await User.findById(new mongoose.Types.ObjectId(id));
    if (!user) return next(new AppError(`user not found`, 400))
    res.json({ user })
}

export async function getUser(_req: Request, _res: Response, _next: NextFunction) {


}

export async function createAccount(req: Request, res: Response, next: NextFunction) {
    const { firstname, lastname, email, username, password, bio } = req.body
    if (!firstname || !lastname || !email || !username || !password) return next(new AppError(`required field: firstname, lastname, email, username, password`, 400))
    try {
        const user = await User.create({ ...req.body })
        console.log(user)
    } catch (err) {
        return next(err);
    }
    return res.status(201).json({ firstname, lastname, email, username, bio });
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
    const user = await getAuthenticatedUser(req, res, next)
    const { firstname, lastname, bio, avatar } = req.body;
    try {
        await User.findByIdAndUpdate(user?.id, { firstname, lastname, bio, avatar })
        return res.json({ firstname, lastname, bio, avatar })
    } catch (err) {
        return next(err)
    }

}

export function deleteAccount() {

}