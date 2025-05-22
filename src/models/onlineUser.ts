import mongoose from 'mongoose';

const onlineUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true, 
    ref: 'User',
  },
  socketId: {
    type: String,
    required: true,
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  },
});

const OnlineUser = mongoose.model('OnlineUser', onlineUserSchema);
export default OnlineUser;
