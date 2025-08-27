import { Schema, model } from "mongoose";

const contentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    media: [{
        url: String,
        type: { type: String, enum: ['image', 'video', 'file'] },
        filename: String,
        size: Number
    }],
    tags: [{ type: String }],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' },
    isPublic: { type: Boolean, default: true },
    views: { type: Number, default: 0 }
}, { timestamps: true });

const commentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    contentId: { type: Schema.Types.ObjectId, required: true, ref: 'Content' },
    comment: { type: String, required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' }, // For nested comments
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Content = model('Content', contentSchema);
const Comment = model('Comment', commentSchema);

try {
    Content.init()
} catch (err) {
    if (err instanceof Error) {
        console.error(err.message)
    } else {
        console.error(err);
    }
}

export default Content;
export { Comment };