import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Container,
  Tooltip,
  makeStyles,
  ClickAwayListener,
  Theme,
} from "@material-ui/core";
import Gravatar from "../util/Gravatar";
import UserTooltip from "./UserTooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface UserListProps {
  data: ChatData;
  value: number;
  socket: SocketIOClient.Socket;
}

interface SocketUser {
  username: string;
  color: string;
  email: string;
  mode: string;
  status: string;
  typing: boolean;
}

interface Open {
  [key: string]: boolean;
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

const useStyles = makeStyles((theme: Theme) => ({
  tooltip: {
    padding: "0",
  },
  user: {
    margin: theme.spacing(1),
  },
}));

const UserList = ({ data, value, socket }: UserListProps): JSX.Element => {
  const room = Object.keys(data)[value];
  const classes = useStyles();
  const [open, setOpen] = useState<Open>({} as Open);

  const handleTooltipOpen = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
  ): void => {
    console.log("opening");
    const username = e.currentTarget.getAttribute("data-username");
    console.log(username);
    setOpen({ ...open, [username as string]: true });
  };

  const handleTooltipClose = (e: React.ChangeEvent<{}>): void => {
    const updatedOpen = {} as Open;
    Object.keys(open).forEach((item) => {
      updatedOpen[item] = false;
    });
    console.log(updatedOpen);
    setOpen(updatedOpen);
  };

  return (
    <>
      {data && (
        <Container>
          <Box style={{ textAlign: "center" }}>
            {data[room] ? (
              <>
                <Typography variant="h4" style={{ fontWeight: "bold" }}>
                  {data[room].userlist.length}{" "}
                  {data[room].userlist.length === 1 ? "User" : "Users"}
                </Typography>
                {data[room].userlist.map((user) => (
                  <Box className={classes.user} key={user.username}>
                    <Tooltip
                      key={user.username}
                      data-username={user.username}
                      classes={{ tooltip: classes.tooltip }}
                      open={open[user.username] || false}
                      onClose={handleTooltipClose}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      PopperProps={{
                        disablePortal: true,
                      }}
                      interactive={true}
                      title={
                        <ClickAwayListener onClickAway={handleTooltipClose}>
                          <Box>
                            <UserTooltip username={user.username} />
                          </Box>
                        </ClickAwayListener>
                      }
                    >
                      <Box
                        display="flex"
                        flexDirection="row"
                        key={user.username}
                        data-username={user.username}
                        onClick={handleTooltipOpen}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Gravatar
                          email={user.email}
                          size={4}
                          userlist
                          mode={user.mode}
                          typing={user.typing}
                        />
                        <Typography
                          variant="h5"
                          style={{ color: user.color, fontWeight: "bold" }}
                        >
                          {user.username}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                ))}
              </>
            ) : null}
          </Box>
        </Container>
      )}
    </>
  );
};

UserList.propTypes = {
  users: PropTypes.array,
};

export default UserList;
