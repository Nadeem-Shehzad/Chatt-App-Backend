import { Server } from "socket.io";

let io: Server;

export const setSocketInstance = (socketInstance: Server): void => {
    io = socketInstance;
    console.log('Io Setup...')
};

export const getSocketInstance = (): Server => {
    if (!io) throw new Error("Socket.io instance not initialized!");
    return io;
};