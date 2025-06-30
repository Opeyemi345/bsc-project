import { Schema, model } from "mongoose";

const contentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    media: String,
    mediaType: { type: String, enum: ['image', 'video', 'file'] },
    content: String,
    upvotes: Number,
});

const commentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    comment: { type: String, required: true }
})

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