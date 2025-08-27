import express, { type Request, type Response } from "express"
import SwaggerUi from "swagger-ui-express"
import { specs } from "./config/swaggerConfig"
import morgan from "morgan"
import cors from "cors"
import dotenv from "dotenv"
import errorHandler from "./utils/errorHandler"
import userRoute from "./routes/UserRoute"
import authRoute from "./routes/AuthRoute"
import contentRoute from "./routes/ContentRoute"
import chatRoute from "./routes/ChatRoute"
import communityRoute from "./routes/CommunityRoute"
import uploadRoute from "./routes/UploadRoute"
import notificationRoute from "./routes/NotificationRoute"
import { initializeEmailService } from "./services/emailService"
import { initializeFirebaseAdmin } from "./config/firebaseAdmin"

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Initialize services
initializeEmailService().catch(console.error)
initializeFirebaseAdmin()

// Routes
app.use('/auth', authRoute)
app.use('/users', userRoute)
app.use('/content', contentRoute)
app.use('/chat', chatRoute)
app.use('/communities', communityRoute)
app.use('/upload', uploadRoute)
app.use('/notifications', notificationRoute)
app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs, { explorer: true }))

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    })
})

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Route not found" })
})

// Error handler
app.use(errorHandler)

export default app;