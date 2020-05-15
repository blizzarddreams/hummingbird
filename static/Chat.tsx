import React, { useRef, useState, useEffect, useContext } from "react";
import { Grid, TextField, makeStyles } from "@material-ui/core";
import UserList from "./UserList";
import Messages from "./Messages";
import { Theme, fade } from "@material-ui/core/styles";
import io from "socket.io-client";
import ChannelList from "./ChannelList";
import DarkModeContext from "./DarkMode";

const socketio = io();

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
interface SocketRoom {
  room: string;
  userlist: SocketUserList;
  messages: SocketMessages;
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
  input: {
    //margin: theme.spacing(2),
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
const Chat = (): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  const { current: socket } = useRef(socketio);
  const [value, setValue] = useState(0);
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
    setValue(newValue);
  };

  const handleNewMessageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setNewMessage(e.target.value);
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
    };
  }, [channels]);

  useEffect(() => {
    fetch("/user/get-id")
      .then((res) => res.json())
      .then((json: AuthData) => {
        if (json.success) {
          socket.emit("authenticate", json.id);
        }
      });
  }, []);

  return (
    <Grid container className={classes.chatBox} spacing={0}>
      <Grid item xs={2} className={classes.chatBoxColumn}>
        <ChannelList
          data={channels}
          value={value}
          handleTabChange={handleTabChange}
        />
      </Grid>
      <Grid item xs={8} className={classes.chatBoxColumn}>
        <Messages data={channels} value={value} />
      </Grid>
      <Grid item xs={2} className={classes.chatBoxColumn}>
        <UserList data={channels} value={value} />
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
  );
};

export default Chat;
