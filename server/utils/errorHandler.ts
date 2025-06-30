import { type Request, type Response } from "express";

export class AppError extends Error {
    constructor(message: string, code?: number) {
        super(message)
        this.status = code;

        Error?.captureStackTrace(this, this.constructor)
    }

    set status(code: number | undefined) {
        this.status = code
    }
}

export default function errorHandler(err: AppError, _req: Request, res: Response) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' })
}