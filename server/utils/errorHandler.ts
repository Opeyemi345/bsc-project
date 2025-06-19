import { type Request, type Response } from "express";

export interface AppError extends Error { 
    status?: number;
}

export default function errorHandler(err: AppError, _req: Request, res: Response) {
    console.error(err);
    res.status(err.status || 500).json({message: err.message || 'Internal Server Error'})
}