import sanitizehtml from "sanitize-html";
import { Server, Socket } from "socket.io";
import crypto from "crypto";
import { validate } from "class-validator";
import { User, Channel, Message } from "./models";

interface SocketUser {
  username: string;
  color: string;
  gravatar: string;
}

interface SocketUserMessage {
  room: string;
  message: string;
  user: SocketUser;
}

interface SocketUserWithRoom {
  user: SocketUser;
  room: string;
}

interface SocketUserWithRoomAndUserList {
  user: SocketUser;
  userlist: UserList;
  room: string;
}

interface ConnectedSocketUser extends Socket {
  username: string;
}

type UserList = SocketUser[];
interface UserServer extends Server {
  username?: string;
}
export default (io: UserServer): void => {
  async function userData(username: string): Promise<SocketUser> {
    const user: User = await User.findOneOrFail({ username });

    const hash: string = crypto
      .createHash("md5")
      .update(user.email)
      .digest("hex");
    const gravatar = `https://www.gravatar.com/avatar/${hash}/`;
    return {
      username: user.username,
      color: user.color,
      gravatar,
    };
  }

  async function userList(room: string): Promise<UserList> {
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
  }

  interface Websocket extends Socket {
    username: string;
  }

  io.on("connection", async (socket: Websocket) => {
    socket.on("user authorized", async (data: { username: string }) => {
      socket.username = data.username;
      const user: User = await User.findOneOrFail({
        where: { username: socket.username },
        relations: ["channels"],
      });

      socket.join("lobby");
      const lobby: Channel = await Channel.findOrCreate("lobby");

      if (!user.channels.map((x) => x.name).includes("lobby")) {
        user.channels.push(lobby);
        await user.save();
      }

      user.channels.forEach(async (channel: Channel) => {
        socket.join(channel.name);

        const differentUserData: SocketUserWithRoom = {
          user: await userData(socket.username),
          room: channel.name,
        };
        socket
          .to(channel.name)
          .emit("a different user joined a room", differentUserData);

        const userlist: UserList = await userList(channel.name);

        const currentUserData: SocketUserWithRoomAndUserList = {
          user: await userData(user.username),
          room: channel.name,
          userlist,
        };
        socket.emit("you joined a room", currentUserData);
      });
      socket.emit("user authorized", await userData(socket.username));
    });

    socket.on("new message", async (data: SocketUserMessage) => {
      let messageData: string | string[] = sanitizehtml(data.message, {
        allowedTags: [],
      });
      const validatePost = new Message();
      validatePost.data = (messageData as string).trim();
      const errors = await validate(validatePost);
      if (errors.length > 0) {
        return false;
      }
      const roomName: string = data.room;

      if ((messageData as string).startsWith("/")) {
        messageData = (messageData as string).slice(1).split(" ");
        const [command, channelName] = messageData;
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
              const currentUserData: SocketUserWithRoomAndUserList = {
                user: await userData(user.username),
                room: channel.name,
                userlist,
              };
              socket.emit("you joined a room", currentUserData);

              socket.to(channelName).emit("a different user joined a room", {
                user: await userData(socket.username),
                room: channelName,
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
        const newMessage: Message = new Message();

        newMessage.data = messageData as string;
        newMessage.user = user;
        await newMessage.save();
        await user.save();

        io.to(roomName).emit("new message", {
          room: roomName,
          createdAt: newMessage.createdAt,
          message: messageData,
          user: await userData(socket.username),
        });
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
        const disconnectingUser: User = await User.findOneOrFail({
          where: { username: socket.username },
          relations: ["channels"],
        });
        const disconnectingUserData: SocketUser = await userData(
          disconnectingUser.username,
        );
        const roomsUserWasIn: string[] = disconnectingUser.channels.map(
          (x) => x.name,
        );
        roomsUserWasIn.forEach(async (roomName: string) => {
          const userDisconnectingData: SocketUserWithRoom = {
            user: disconnectingUserData,
            room: roomName,
          };
          socket
            .to(roomName)
            .emit("a different user is disconnecting", userDisconnectingData);
        });
      }
    });
  });
};
