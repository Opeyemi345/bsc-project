import { connect } from "mongoose";

export async function connectToDb() {
    const DB_URI = process.env.HOSTED_DB_URI || 'mongodb//localhost:27017'
    try {

        await connect(
            DB_URI
        )
    } catch (err) {
        if (err instanceof Error) {
            console.error("Database connection failed with ", err.message);
        } else {
            console.error("Database connection failed with err: ", err);
        }
        process.exit(1)
    }

}