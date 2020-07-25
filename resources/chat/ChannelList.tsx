import React from "react";
import { Tabs, Tab, makeStyles, IconButton, Box } from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";
interface UserListProps {
  data: ChatData;
  value: number;
  handleTabChange: (e: React.ChangeEvent<{}>, newValue: number) => void;
  handleChannelLeave: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
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
  closeButton: {
    color: "#FB4B4E",
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
  handleChannelLeave,
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
              label={
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-around"
                  style={{ width: "100%" }}
                >
                  <Box>{roomName}</Box>
                  <Box>
                    <IconButton
                      className={classes.closeButton}
                      onClick={handleChannelLeave}
                      data-name={roomName}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Box>
              }
              {...a11yProps(index)}
            />
          ))
        : null}
    </Tabs>
  );
};

export default ChannelList;
