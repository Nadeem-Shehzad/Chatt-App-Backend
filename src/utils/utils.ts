import Contact from "../models/contact";
import { IContact, IMessage } from "./customTypes";
import { userSocketMap } from "../socket/socket";
import { getSocketInstance } from "./socketInstance";

export const sendNewContactRequest = async ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {

    const newContact = await Contact.create({
        requester: senderId,
        receiver: receiverId,
        status: 'pending'
    });

    const io = getSocketInstance();
    const targetSocketId = userSocketMap.get(receiverId);
    if (targetSocketId) {
        io.to(targetSocketId).emit('contactRequestReceived', {
            contactId: newContact._id,
            from: senderId,
        });
    }

    return {
        success: false,
        message: 'Contact request sent. Please wait for acceptance.',
        data: null,
    };
}


export const checkContactStatus = ({ contact }: { contact: IContact }) => {

    if (contact && contact.status === 'blocked') {
        return {
            success: false,
            message: 'You are blocked or have blocked this user.',
            data: null,
        };
    }

    if (contact && contact.status !== 'accepted') {
        return {
            success: false,
            message: 'Contact request is still pending.',
            data: null,
        };
    }

    return null;
}


export const sendMessageToReceiver = async ({ senderId, receiverId, message }: { senderId: string; receiverId: string; message: IMessage }): Promise<boolean> => {
    const io = getSocketInstance();
    const targetSocketId = userSocketMap.get(receiverId);
    if (targetSocketId) {
        io.to(targetSocketId).emit('newMessage', {
            sender: senderId,
            receiver: receiverId,
            content: message.content,
            createdAt: message.createdAt,
        });

        message.delivered = true;
        await message.save();

        return true;
    }
    return false;
}