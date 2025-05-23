import mongoose from 'mongoose';
import { IMessageDTO } from '../utils/customTypes';

const messageSchema = new mongoose.Schema<IMessageDTO>({
   sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   content: {
      type: String,
      required: true
   },
   deliveredAt: {
      type: Date,
      default: null
   },
   seen: {
      type: Boolean,
      default: false
   },
   seenAt: {
      type: Date,
      default: null
   }
}, {
   timestamps: true  // adds createdAt and updatedAt
});


const Message = mongoose.model<IMessageDTO>('Message', messageSchema);
export default Message;