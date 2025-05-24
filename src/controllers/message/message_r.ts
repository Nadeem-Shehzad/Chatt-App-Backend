import { Types } from 'mongoose';
import Message from '../../models/message';
import { IMessageDTO, MessageResponse, MessagesResponse, MyContext, AllChatsResponse, ChatSummary } from '../../utils/customTypes';
import Contact from '../../models/contact';
import { compose, ErrorHandling, isAuthenticated, checkContent } from '../../middlewares/common';
import { checkContactStatus, sendNewContactRequest, sendMessageToReceiver } from '../../utils/utils';
import User from '../../models/user';



export const sendMessage = compose(ErrorHandling, isAuthenticated, checkContent)
  (async (_: any, { receiverId, content }: { receiverId: string, content: string }, context: MyContext): Promise<MessageResponse> => {
    const senderId = context.userId;

    if (!senderId || !receiverId) {
      return {
        success: false,
        message: 'Sender or receiver not found.',
        data: null,
      };
    }

    const existingContact = await Contact.findOne({
      $or: [
        { requester: senderId, receiver: receiverId },
        { requester: receiverId, receiver: senderId }
      ]
    });

    if (!existingContact) {
      return await sendNewContactRequest({ senderId, receiverId });
    }

    const statusCheck = checkContactStatus({ contact: existingContact });
    if (statusCheck) return statusCheck;

    // Create message with no deliveredAt initially
    const createdMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      deliveredAt: null,
      seen: false,
      seenAt: null,
    });

    // Attempt to deliver
    const wasDelivered = await sendMessageToReceiver({
      senderId,
      receiverId,
      message: createdMessage,
    });

    // Fetch updated message to return updated deliveredAt (if set)
    const finalMessage = await Message.findById(createdMessage._id);

    const savedMessage: IMessageDTO = {
      _id: finalMessage!._id as Types.ObjectId,
      sender: finalMessage!.sender,
      receiver: finalMessage!.receiver,
      content: finalMessage!.content,
      deliveredAt: finalMessage!.deliveredAt,
      seen: finalMessage!.seen,
      seenAt: finalMessage!.seenAt,
      createdAt: finalMessage!.createdAt,
      updatedAt: finalMessage!.updatedAt,
    };

    return {
      success: true,
      message: wasDelivered
        ? 'Message sent and delivered successfully'
        : 'Message sent, but receiver is offline',
      data: savedMessage,
    };
  });


export const getMessages = compose(ErrorHandling, isAuthenticated)(async (_: any, { receiverId }: { receiverId: string }, context: MyContext): Promise<MessagesResponse> => {

  const senderId = context.userId;
  const messages = await Message.find({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId }
    ]
  });

  return {
    success: true,
    message: 'All Messages',
    data: messages
  };
});


// export const getAllChats = compose(ErrorHandling, isAuthenticated)(async (_: any, __: any, context: MyContext): Promise<AllChatsResponse> => {

//   const objectUserId = new Types.ObjectId(context.userId);

//   // Aggregate to get last message per chat partner
//   const messages = await Message.aggregate([
//     {
//       $match: {
//         $or: [
//           { sender: objectUserId },
//           { receiver: objectUserId }
//         ]
//       }
//     },
//     {
//       $sort: { createdAt: -1 }
//     },
//     {
//       $project: {
//         sender: 1,
//         receiver: 1,
//         content: 1,
//         createdAt: 1,
//         chatUser: {
//           $cond: [
//             { $eq: ["$sender", objectUserId] },
//             "$receiver",
//             "$sender"
//           ]
//         }
//       }
//     },
//     {
//       $group: {
//         _id: "$chatUser",
//         lastMessage: { $first: "$content" },
//         createdAt: { $first: "$createdAt" }
//       }
//     },
//     {
//       $sort: { createdAt: -1 }
//     }
//   ]);

//   //console.log("Chat summaries:", messages);

//   const chatSummaries = await Promise.all(
//     messages.map(async (msg) => {
//       const user = await User.findById(msg._id).lean(); // or use a batch query if needed

//       return {
//         user: {
//           _id: msg._id,
//           username: user?.username || 'Unknown'
//         },
//         lastMessage: msg.lastMessage,
//         time: msg.createdAt instanceof Date
//           ? msg.createdAt.toISOString()
//           : new Date().toISOString() // fallback just in case
//       };
//     })
//   );

//   return {
//     success: true,
//     message: 'All Chats',
//     data: chatSummaries
//   };
// });



export const getAllChats = compose(ErrorHandling, isAuthenticated)(
  async (_: any, __: any, context: MyContext): Promise<AllChatsResponse> => {
    const objectUserId = new Types.ObjectId(context.userId);

    // Step 1: Get all last messages per chat
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: objectUserId },
            { receiver: objectUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $project: {
          sender: 1,
          receiver: 1,
          content: 1,
          createdAt: 1,
          chatUser: {
            $cond: [
              { $eq: ["$sender", objectUserId] },
              "$receiver",
              "$sender"
            ]
          }
        }
      },
      {
        $group: {
          _id: "$chatUser",
          lastMessage: { $first: "$content" },
          createdAt: { $first: "$createdAt" }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Step 2: Get unread count for all chats in one go
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: objectUserId,
          seenAt: null
        }
      },
      {
        $group: {
          _id: "$sender", // Group by sender of unread messages
          unreadCount: { $sum: 1 }
        }
      }
    ]);

    // Step 3: Create map of unread counts
    const unreadMap: Record<string, number> = {};
    unreadCounts.forEach((item) => {
      unreadMap[item._id.toString()] = item.unreadCount;
    });

    // Step 4: Attach user info and unread count to each chat summary
    const chatSummaries = await Promise.all(
      messages.map(async (msg) => {
        const user = await User.findById(msg._id).lean();
        return {
          user: {
            _id: msg._id,
            username: user?.username || 'Unknown',
            lastSeen: user?.lastSeen instanceof Date ? user.lastSeen : new Date(0)
          },
          lastMessage: msg.lastMessage,
          time: msg.createdAt instanceof Date
            ? msg.createdAt.toISOString()
            : new Date().toISOString(),
          unreadCount: unreadMap[msg._id.toString()] || 0 
        };
      })
    );

    return {
      success: true,
      message: 'All Chats',
      data: chatSummaries
    };
  }
);




export const markMessagesAsSeen = compose(ErrorHandling, isAuthenticated)(async (_: any, { receiverId }: { receiverId: string }, context: MyContext): Promise<MessageResponse> => {

  const senderId = context.userId;
  const now = new Date();

  await Message.updateMany(
    {
      sender: new Types.ObjectId(senderId),
      receiver: new Types.ObjectId(receiverId),
      seen: false,
    },
    [
      {
        $set: {
          seen: true,
          seenAt: now,
          deliveredAt: {
            $cond: {
              if: { $eq: ["$deliveredAt", null] }, // if deliveredAt is null
              then: now, // set deliveredAt = now
              else: "$deliveredAt", // keep existing deliveredAt
            },
          },
        },
      },
    ]
  );

  return {
    success: true,
    message: 'Messages marked as seen.',
    data: null
  };
});


export const deleteMessage = compose(ErrorHandling, isAuthenticated)(async (_: any, { messageId }: { messageId: string }, context: MyContext): Promise<MessageResponse> => {

  const senderId = context.userId;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error('Message not found!');
  }

  if (message.sender.toString() !== senderId) {
    throw new Error(`You can't delete other's message.`);
  }

  const deletedMessage = await Message.findByIdAndDelete(messageId);

  return {
    success: true,
    message: 'Message deleted successfully',
    data: null
  };
});