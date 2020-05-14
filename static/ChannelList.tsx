import React from "react";
import { Tabs, Tab, makeStyles } from "@material-ui/core";
interface UserListProps {
  data: ChatData;
  value: number;
  handleTabChange: (e: React.ChangeEvent<{}>, newValue: number) => void;
}
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
interface ChatData {
  [room: string]: {
    messages: SocketMessages;
    userlist: SocketUserList;
  };
}

interface A11yProps {
  id: string;
  "aria-controls": string;
}

const useStyles = makeStyles(() => ({
  tab: {
    fontFamily: "'Roboto', sans-serif",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  indicator: {
    backgroundColor: "#23f0c7",
  },
}));

const a11yProps = (index: number): A11yProps => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};
const ChannelList = ({
  data,
  value,
  handleTabChange,
}: UserListProps): JSX.Element => {
  const classes = useStyles();
  return (
    <Tabs
      orientation="vertical"
      value={value}
      onChange={handleTabChange}
      classes={{ indicator: classes.indicator }}
    >
      {Object.keys(data).length > 0
        ? Object.keys(data).map((roomName, index) => (
            <Tab
              className={classes.tab}
              key={roomName}
              label={roomName}
              {...a11yProps(index)}
            />
          ))
        : null}
    </Tabs>
  );
};

export default ChannelList;
