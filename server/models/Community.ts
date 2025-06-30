import { Schema, model } from "mongoose"

const communitySchema = new Schema({
    organizer: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    members: { type: [Schema.Types.ObjectId], ref: 'User'}
})

const Community = model('Community', communitySchema);

try {
    Community.init()
} catch (err) {
    if (err instanceof Error) {
        console.error(err.message)
    } else {
        console.error(err);
    }
}

export default Community;