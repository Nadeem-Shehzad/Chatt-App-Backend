import mongoose, { Schema } from "mongoose";
import { IGroup } from '../utils/customTypes'

const groupSchema = new Schema<IGroup>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }]
}, {
    timestamps: true
});

const Group = mongoose.model<IGroup>('Group', groupSchema);

export default Group;