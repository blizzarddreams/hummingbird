import React, { useRef, useState, useEffect, useContext } from "react";
import {
  Grid,
  TextField,
  makeStyles,
  Hidden,
  SwipeableDrawer,
} from "@material-ui/core";
import UserList from "./UserList";
import Messages from "./Messages";
import { Theme, fade } from "@material-ui/core/styles";
import io from "socket.io-client";
import ChannelList from "./ChannelList";
import DarkModeContext from "../DarkMode";
import Cookies from "js-cookie";

interface SocketUser {
  username: string;
  color: string;
  email: string;
  mode: string;
  status: string;
  typing: boolean;
}

interface SocketMessage {
  user: SocketUser;
  message: string;
  timestamp: Date;
  room: string;
}

interface StatusAndModeUpdated {
  status: string;
  mode: string;
  username: string;
}

type SocketUserList = SocketUser[];
type SocketMessages = SocketMessage[];
interface ChatData {
  [room: string]: {
    messages: SocketMessages;
    userlist: SocketUserList;
  };
}

interface AuthData {
  success: boolean;
  id: string;
}

interface UserIsTyping {
  username: string;
  room: string;
}

interface YouJoinedARoom {
  room: string;
  userlist: SocketUserList;
}

interface ADifferentUserJoinedARoom {
  room: string;
  user: SocketUser;
}

interface StyleProps {
  darkMode: boolean;
}

interface ChatProps {
  socket: SocketIOClient.Socket;
  drawer: {
    userList: boolean;
    channelList: boolean;
  };
  toggleChannelList: (e: React.MouseEvent<HTMLButtonElement>) => void;
  toggleUserList: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

type ADifferentUserIsDisconnecting = ADifferentUserJoinedARoom;

const useStyles = makeStyles((theme: Theme) => ({
  chatBox: {
    height: "90% !important",
  },
  chatBoxColumn: {
    height: "80% !important",
    overflow: "auto",
  },
  newMessageColumn: {
    display: "flex",
    flexDirection: "column-reverse",
  },
  channelListButton: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#dff0f7" : "#070914",
    color: props.darkMode ? "#070914" : "#dff0f7",
    position: "fixed",
    left: 0,
    top: "4rem !important",
    margin: "2rem !important",
  }),
  userListButton: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#dff0f7" : "#070914",
    color: props.darkMode ? "#070914" : "#dff0f7",
    position: "fixed",
    left: 0,
    top: "10rem !important",
    margin: "2rem !important",
  }),
  drawer: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#0a0e0c" : "#dff7eb",
    color: props.darkMode ? "#dff7eb" : "#0a0e0c",
    width: "100%",
  }),

  input: {
    height: "20% !important",
    "& .MuiFormLabel-root": {
      color: (props: StyleProps): string => (props.darkMode ? "#eee" : "#222"),
    },
    "& .MuiOutlinedInput-root": {
      color: (props: StyleProps): string => (props.darkMode ? "#eee" : "#222"),
      backgroundColor: fade("#66d0f9", 0.1),
      borderRadius: "0",

      "&.Mui-focused fieldset": {
        borderColor: "#23f0c7",
      },
    },
    "&:focus": {
      borderColor: "#eee",
    },
  },
}));
const Chat = ({
  drawer,
  toggleUserList,
  toggleChannelList,
  socket,
}: ChatProps): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  const [value, setValue] = useState(0);
  const [typing, setTyping] = useState<NodeJS.Timeout | number>(null!);
  const [channels, setChannels] = useState<ChatData>({} as ChatData);
  const [newMessage, setNewMessage] = useState("");

  const sortUserlist = (): void => {
    const rooms = Object.keys(channels);
    rooms.forEach((room) => {
      channels[room].userlist.sort((a, b) =>
        a.username.localeCompare(b.username),
      );
    });
  };

  const handleTabChange = (
    e: React.ChangeEvent<{}>,
    newValue: number,
  ): void => {
    //e.preventDefault();
    // const tag: string = (e.target as HTMLDivElement).tagName;
    const index = Object.keys(channels)[newValue];
    if (index !== undefined) {
      setValue(newValue);
    }
  };

  const handleChannelLeave = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    const room = e.currentTarget.getAttribute("data-name") as string;
    if (room !== "lobby") {
      // room = room as string;
      const indexOfRoom = Object.keys(channels).indexOf(room);
      delete channels[room];

      if (value === indexOfRoom) {
        setChannels({ ...channels });
        handleTabChange(e, 0);
      }
    }
  };

  const handleNewMessageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const room = Object.keys(channels)[value];
    socket.emit("user is typing", room);
    setNewMessage(e.target.value);

    clearTimeout(typing as NodeJS.Timeout);
    setTyping(
      setTimeout(() => {
        socket.emit("user stopped typing", room);
      }, 5000),
    );
  };

  const handleNewMessageSubmit = (
    e: React.FormEvent<HTMLFormElement>,
  ): void => {
    e.preventDefault();
    const room = Object.keys(channels)[value];
    socket.emit("new message", { room, message: newMessage });
    setNewMessage("");
  };

  useEffect(() => {
    socket.on("new message", (data: SocketMessage) => {
      setChannels({
        ...channels,
        [data.room]: {
          userlist: channels[data.room].userlist,
          messages: channels[data.room].messages.concat(data),
        },
      });
    });

    socket.on("user is typing", (data: UserIsTyping) => {
      setChannels({
        ...channels,
        [data.room]: {
          messages: channels[data.room].messages,
          userlist: channels?.[data.room]?.userlist.map((user) => {
            if (user.username === data.username) {
              user.typing = true;
            }
            return user;
          }),
        },
      });
    });

    socket.on("status and mode updated", (data: StatusAndModeUpdated) => {
      console.log("received in chat.tsx");
      const updatedChannels = {} as ChatData;
      Object.keys(channels).map((room) => {
        updatedChannels[room] = channels[room];
        updatedChannels[room].userlist.map((user) => {
          if (user.username === data.username) {
            user.status = data.status;
            user.mode = data.mode;
          }
          return user;
        });
      });
      console.log(updatedChannels);
      setChannels(updatedChannels);
    });

    socket.on("user stopped typing", (data: UserIsTyping) => {
      setChannels({
        ...channels,
        [data.room]: {
          messages: channels[data.room].messages,
          userlist: channels?.[data.room]?.userlist.map((user) => {
            if (user.username === data.username) {
              user.typing = false;
            }
            return user;
          }),
        },
      });
    });

    socket.on("you joined a room", (data: YouJoinedARoom) => {
      setChannels({
        ...channels,
        [data.room]: { messages: [], userlist: data.userlist },
      });
      sortUserlist();
    });

    socket.on(
      "a different user joined a room",
      (data: ADifferentUserJoinedARoom) => {
        setChannels({
          ...channels,
          [data.room]: {
            messages: channels[data.room].messages,
            userlist: channels[data.room].userlist.concat(data.user),
          },
        });
        sortUserlist();
      },
    );

    socket.on(
      "a different user is disconnecting",
      (data: ADifferentUserIsDisconnecting) => {
        setChannels({
          ...channels,
          [data.room]: {
            messages: channels[data.room].messages,
            userlist: channels[data.room].userlist.filter(
              (user) => user.username !== data.user.username,
            ),
          },
        });
        sortUserlist();
      },
    );
    return (): void => {
      socket.off("you joined a room");
      socket.off("new message");
      socket.off("a different user joined a room");
      socket.off("a different user is disconnecting");
      socket.off("user is typing");
      socket.off("user stopped typing");
      socket.off("status and mode updated");
    };
  }, [channels]);

  useEffect(() => {
    fetch("/user/get-id", {
      headers: {
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
    })
      .then((res) => res.json())
      .then((json: AuthData) => {
        if (json.success) {
          socket.emit("authenticate", json.id);
        }
      });
  }, []);

  return (
    <>
      {channels && (
        <>
          <Hidden smUp>
            <Grid container className={classes.chatBox} spacing={0}>
              <SwipeableDrawer
                anchor={"left"}
                data-name={"channelList"}
                open={drawer.channelList}
                onClose={toggleChannelList}
                onOpen={toggleChannelList}
                classes={{ paper: classes.drawer }}
              >
                <ChannelList
                  data={channels}
                  value={value}
                  handleTabChange={handleTabChange}
                  handleChannelLeave={handleChannelLeave}
                />
              </SwipeableDrawer>
              <SwipeableDrawer
                anchor={"right"}
                data-name={"userList"}
                open={drawer.userList}
                onClose={toggleUserList}
                onOpen={toggleUserList}
                classes={{ paper: classes.drawer }}
              >
                <UserList data={channels} value={value} socket={socket} />
              </SwipeableDrawer>
              <Grid item xs={12} className={classes.chatBoxColumn}>
                <Messages data={channels} value={value} />
              </Grid>
              <Grid item xs={12}>
                <form onSubmit={handleNewMessageSubmit}>
                  <TextField
                    name="message"
                    fullWidth
                    variant="outlined"
                    onChange={handleNewMessageChange}
                    value={newMessage}
                    classes={{ root: classes.input }}
                  />
                </form>
              </Grid>
            </Grid>
          </Hidden>
          <Hidden xsDown>
            <Grid container className={classes.chatBox} spacing={0}>
              <Grid item xs={2} className={classes.chatBoxColumn}>
                <ChannelList
                  data={channels}
                  value={value}
                  handleTabChange={handleTabChange}
                  handleChannelLeave={handleChannelLeave}
                />
              </Grid>
              <Grid item xs={8} className={classes.chatBoxColumn}>
                <Messages data={channels} value={value} />
              </Grid>
              <Grid item xs={2} className={classes.chatBoxColumn}>
                <UserList data={channels} value={value} socket={socket} />
              </Grid>
              <Grid item xs={12} className={classes.newMessageColumn}>
                <form onSubmit={handleNewMessageSubmit}>
                  <TextField
                    name="message"
                    fullWidth
                    variant="outlined"
                    onChange={handleNewMessageChange}
                    value={newMessage}
                    classes={{ root: classes.input }}
                  />
                </form>
              </Grid>
            </Grid>
          </Hidden>
        </>
      )}
    </>
  );
};

export default Chat;
