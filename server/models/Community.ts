import { Schema, model } from "mongoose"

const communitySchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    organizer: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    memberCount: { type: Number, default: 0 },
    avatar: { type: String },
    banner: { type: String },
    rules: [{ type: String }],
    tags: [{ type: String }],
    isPrivate: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    joinRequests: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        requestedAt: { type: Date, default: Date.now },
        message: { type: String }
    }],
    settings: {
        allowMemberPosts: { type: Boolean, default: true },
        requireApproval: { type: Boolean, default: false },
        allowInvites: { type: Boolean, default: true }
    }
}, { timestamps: true })

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