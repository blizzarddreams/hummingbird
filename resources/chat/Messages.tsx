import React, { useRef, useState, useEffect } from "react";
import {
  Typography,
  Box,
  Tooltip,
  ClickAwayListener,
  makeStyles,
} from "@material-ui/core";
import Gravatar from "../util/Gravatar";
import Moment from "../util/Moment";
import UserTooltip from "./UserTooltip";

interface MessagesProps {
  data: ChatData;
  value: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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

const useStyles = makeStyles(() => ({
  timestamp: {
    fontFamily: "'Roboto Mono', monospace",
  },
  text: {
    fontWeight: "bold",
  },
  message: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  tooltip: {
    padding: "0",
  },
}));

const TabPanel = (props: TabPanelProps): JSX.Element => {
  const { children, value, index, ...other } = props;
  return (
    <Typography
      component="div"
      role="tabpanel"
      style={{ width: "100%" }}
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box p={4}>{children}</Box>}
    </Typography>
  );
};
const Messages = ({ data, value }: MessagesProps): JSX.Element => {
  const messageRef = useRef<HTMLDivElement>(null);
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  const handleTooltipOpen = (): void => setOpen(true);

  const handleTooltipClose = (): void => setOpen(false);

  useEffect(() => {
    messageRef?.current?.scrollIntoView();
  }, [data]);

  return (
    <div style={{ height: "100% !important" }}>
      {data
        ? Object.keys(data).map((channel, index) => (
            <TabPanel value={value} index={index} key={channel}>
              <Box
                display="flex"
                flexDirection="column"
                style={{ height: "100%!important" }}
              >
                {data[channel].messages.map((message) => (
                  <Box
                    display="flex"
                    style={{ margin: "1rem" }}
                    flexDirection={"row"}
                    key={message.user.username}
                  >
                    <Typography variant="body1" className={classes.message}>
                      <Box component="span" className={classes.timestamp}>
                        [<Moment time={message.timestamp.toString()} />]
                      </Box>

                      <Box component="span">
                        <ClickAwayListener onClickAway={handleTooltipClose}>
                          <Tooltip
                            key={message.user.username}
                            classes={{ tooltip: classes.tooltip }}
                            open={open}
                            onClose={handleTooltipClose}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            placement="left-start"
                            interactive={true}
                            title={
                              <UserTooltip username={message.user.username} />
                            }
                          >
                            <Box
                              onClick={handleTooltipOpen}
                              className={classes.message}
                            >
                              <Gravatar email={message.user.email} size={4} />
                              <Box
                                className={classes.text}
                                style={{ color: message.user.color }}
                              >
                                {message.user.username}
                              </Box>
                            </Box>
                          </Tooltip>
                        </ClickAwayListener>
                      </Box>
                      <Box
                        className={classes.text}
                        style={{ wordBreak: "break-all" }}
                      >
                        : {message.message}
                      </Box>
                    </Typography>
                  </Box>
                ))}
              </Box>
              <div ref={messageRef}></div>
            </TabPanel>
          ))
        : null}
    </div>
  );
};

Messages.propTypes = {};

export default Messages;
