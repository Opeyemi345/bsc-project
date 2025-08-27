import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import app from "./app";
import { connectToDb } from "./config/index";

const PORT = process.env.PORT || 5000

connectToDb().then(() => {
    app.listen(PORT, () => {
        console.info("Server started, initilized at port " + PORT)
    })
}).catch((err) => {
    console.error(err)
})