import app from "./app.ts";
import { connectToDb } from "./config/index.ts";

const PORT = process.env.PORT || 5000

connectToDb().then(() => {
    app.listen(PORT, () => {
        console.info("Server started, initilized at port " + PORT)
    })
}).catch((err) => {
    console.error(err)
})