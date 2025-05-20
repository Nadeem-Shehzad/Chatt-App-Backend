import mongoose, { Schema } from "mongoose";
import { IContact } from '../utils/customTypes';


const ContactSchema: Schema = new Schema({
    requester: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending'
    }
}, { timestamps: true });

const Contact = mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;