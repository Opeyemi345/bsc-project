import { Schema, model } from "mongoose";

// Individual message schema
const messageSchema = new Schema({
    chatId: { type: Schema.Types.ObjectId, required: true, ref: 'Chat' },
    senderId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, required: true },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    fileUrl: { type: String }, // For image/file messages
    fileName: { type: String }, // Original filename for file messages
    readBy: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now }
    }],
    editedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Chat/Conversation schema
const chatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    chatType: {
        type: String,
        enum: ['direct', 'group'],
        default: 'direct'
    },
    chatName: { type: String }, // For group chats
    chatDescription: { type: String }, // For group chats
    chatAvatar: { type: String }, // For group chats
    adminUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // For group chats
    lastMessage: {
        content: String,
        senderId: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now }
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Add indexes for better performance
chatSchema.index({ participants: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });
messageSchema.index({ chatId: 1, createdAt: -1 });

const Chat = model('Chat', chatSchema);
const Message = model('Message', messageSchema);

// Initialize models
try {
    Chat.init();
    Message.init();
} catch (err) {
    if (err instanceof Error) {
        console.error('Chat model initialization error:', err.message);
    } else {
        console.error('Chat model initialization error:', err);
    }
}

export default Chat;
export { Message };
