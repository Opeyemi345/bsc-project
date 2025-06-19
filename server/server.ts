import app from "./app";
import { connectToDb } from "./config";

const PORT = process.env.PORT || 5000

connectToDb();

app.listen(PORT, () => {
    console.info("Server started, initilized at port " + PORT)
})