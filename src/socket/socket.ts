import { Server } from "socket.io";

const setupSocket = (io: Server): void => {
   io.on('connection', (socket) => {
      console.log(`A user Connected with id --> ${socket.id}`);

      socket.on('message', (message) => {
         io.emit('recieve-messgae', message);
      });

      socket.on('disconnect', () => {
         console.log(`user --> ${socket.id} is disconnected.`);
      });
   });
}

export default setupSocket;