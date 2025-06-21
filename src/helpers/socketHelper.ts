import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';

const connectedUsers = new Map<string, string>();

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'));

    socket.on("register",(userID: string)=>{
      connectedUsers.set(userID, socket.id);
      logger.info(colors.cyan(`User ${userID} connected with socket ${socket.id}`));
    });

    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });

  });
};

export const socketHelper = { socket, connectedUsers};
