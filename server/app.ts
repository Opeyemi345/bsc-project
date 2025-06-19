import express, { type Request, type Response } from "express"
import morgan from "morgan"
 
const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('dev'))


app.use((_req: Request, res: Response)=>{
    res.status(404).json("Route not found")
})

export default app;