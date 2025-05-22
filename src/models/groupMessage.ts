import mongoose, { Schema } from "mongoose";
import { IGroupMessage } from '../utils/customTypes'


const groupMessageSchema = new Schema<IGroupMessage>({
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true }
}, { timestamps: true });

const GroupMessage = mongoose.model<IGroupMessage>('GroupMessage', groupMessageSchema);

export default GroupMessage;