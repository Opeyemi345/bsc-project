import express, { type Request, type Response } from "express"
import SwaggerUi from "swagger-ui-express"
import { specs } from "./config/swaggerConfig.ts"
import morgan from "morgan"
import errorHandler from "./utils/errorHandler.ts"
import userRoute from "./routes/UserRoute.ts"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/users', userRoute)
app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs, { explorer: true }))
app.use((_req: Request, res: Response) => { res.status(404).json("Route not found") })
app.use(errorHandler)

export default app;