import sanitizehtml from "sanitize-html";
import { Server, Socket } from "socket.io";
import { validate } from "class-validator";
import { User, Channel, Message } from "./models";

interface SocketUser {
  username: string;
  color: string;
  email: string;
}

interface SocketMessage {
  user: SocketUser;
  message: string;
  timestamp: Date;
  room: string;
}

type SocketUserList = SocketUser[];
type SocketMessages = SocketMessage[];

interface SocketUserMessage {
  room: string;
  message: string;
  user?: SocketUser;
}

interface ConnectedSocketUser extends Socket {
  username: string;
}

type UserList = SocketUser[];
interface UserServer extends Server {
  username?: string;
}
export default (io: UserServer): void => {
  const userData = async (username: string): Promise<SocketUser> => {
    const user: User = await User.findOneOrFail({ username });
    return {
      username: user.username,
      color: user.color,
      email: user.email,
    };
  };

  const userList = async (room: string): Promise<SocketUserList> => {
    return new Promise((resolve) => {
      io.in(room).clients(async (err: Error, clients: string[]) => {
        const userListData: Promise<UserList> = Promise.all(
          clients.map(async (user: string) => {
            const userName: string = (io.sockets.connected[
              user
            ] as ConnectedSocketUser).username;
            const data: SocketUser = await userData(userName);
            return data;
          }),
        );
        resolve(userListData);
      });
    });
  };

  interface Websocket extends Socket {
    username: string;
    userId: number;
  }

  io.on("connection", async (socket: Websocket) => {
    socket.on("authenticate", async (id: string) => {
      const user: User | undefined = await User.findOne({
        where: { id },
        relations: ["channels"],
      });

      if (!user) return false;
      socket.userId = user.id;
      socket.username = user.username;

      socket.join("lobby");
      const lobby: Channel = await Channel.findOrCreate("lobby");

      if (!user.channels.map((x) => x.name).includes("lobby")) {
        user.channels.push(lobby);
        await user.save();
      }

      user.channels.forEach(async (channel: Channel) => {
        socket.join(channel.name);

        const data = {
          room: channel.name,
          user: await userData(socket.username),
        };
        socket.to(channel.name).emit("a different user joined a room", data);

        const userlist: SocketUserList = await userList(channel.name);

        socket.emit("you joined a room", { room: channel.name, userlist });
      });
      socket.emit("user authorized", await userData(socket.username));
    });

    socket.on("new message", async (data: SocketUserMessage) => {
      data.message = sanitizehtml(data.message, {
        allowedTags: [],
      });
      const validatePost = new Message();
      validatePost.data = data.message.trim();
      const errors = await validate(validatePost);
      if (errors.length > 0) {
        return false;
      }
      const roomName: string = data.room;

      if (data.message.startsWith("/")) {
        const messageData = data.message.slice(1).split(" ");
        const command = messageData[0];
        const channelName = messageData[1].trim();
        if (channelName.length === 0) return false;
        switch (command) {
          case "join": {
            const user = await User.findOneOrFail({
              where: { username: socket.username },
              relations: ["channels"],
            });
            const channel = await Channel.findOrCreate(channelName);
            if (!user.channels.map((x) => x.name).includes(channelName)) {
              user.channels.push(channel);
              socket.join(channel.name);
              const userlist = await userList(channel.name);

              socket.emit("you joined a room", {
                room: channel.name,
                userlist,
              });

              socket.to(channelName).emit("a different user joined a room", {
                user: await userData(socket.username),
                room: channel.name,
              });
            }
            break;
          }
          case "leave": {
            const user = await User.findOneOrFail({
              where: { username: socket.username },
              relations: ["channels"],
            });

            user.channels = user.channels.filter((x) => x.name !== channelName);
            await user.save();

            const userlist = await userList(channelName);
            socket.emit("you left a room", {
              user: userData(user.username),
              room: channelName,
              userlist,
            });

            break;
          }
          default:
        }
      } else {
        const user: User = await User.findOneOrFail({
          where: { username: socket.username },
          relations: ["channels"],
        });
        const message: Message = new Message();

        message.data = data.message;
        message.user = user;
        await message.save();
        await user.save();

        const socketMessage: SocketMessage = {
          user: await userData(socket.username),
          message: message.data,
          timestamp: message.createdAt,
          room: roomName,
        };

        io.in(roomName).emit("new message", socketMessage);
      }
    });

    socket.on("get user list", async (room) => {
      const userlist = await userList(room);
      socket.emit("get user list", {
        room,
        userlist,
      });
    });

    socket.on("disconnecting", async () => {
      if (socket.username) {
        const rooms: string[] = Object.keys(socket.rooms).slice(1); // we don't want the first room.
        const disconnectingUser = await userData(socket.username);
        rooms.forEach((room) => {
          socket.in(room).emit("a different user is disconnecting", {
            user: disconnectingUser,
            room,
          });
        });
      }
    });
  });
};
