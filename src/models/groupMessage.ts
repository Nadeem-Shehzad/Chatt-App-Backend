import mongoose, { Schema } from "mongoose";
import { IGroupMessage } from '../utils/customTypes'


const groupMessageSchema = new Schema<IGroupMessage>({
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messageId: { type: Schema.Types.ObjectId, required: true, unique: true },
    content: { type: String, required: true },
    seenBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }]
}, { timestamps: true });

const GroupMessage = mongoose.model<IGroupMessage>('GroupMessage', groupMessageSchema);

export default GroupMessage; 