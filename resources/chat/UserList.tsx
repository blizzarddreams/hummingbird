import React, { useState } from "react";
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
interface UserListProps {
  data: ChatData;
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

const useStyles = makeStyles((theme: Theme) => ({
  tooltip: {
    padding: "0",
  },
  user: {
    margin: theme.spacing(1),
  },
}));

const UserList = ({ data, value }: UserListProps): JSX.Element => {
  const room = Object.keys(data)[value];
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleTooltipOpen = (): void => setOpen(true);

  const handleTooltipClose = (): void => setOpen(false);

  return (
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
                <ClickAwayListener onClickAway={handleTooltipClose}>
                  <Tooltip
                    key={user.username}
                    classes={{ tooltip: classes.tooltip }}
                    open={open}
                    onClose={handleTooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    placement="left-start"
                    interactive={true}
                    title={<UserTooltip username={user.username} />}
                  >
                    <Box
                      display="flex"
                      flexDirection="row"
                      key={user.username}
                      onClick={handleTooltipOpen}
                      justifyContent="center"
                    >
                      <Gravatar email={user.email} size={4} />
                      <Typography
                        variant="h5"
                        style={{ color: user.color, fontWeight: "bold" }}
                      >
                        {user.username}
                      </Typography>
                    </Box>
                  </Tooltip>
                </ClickAwayListener>
              </Box>
            ))}
          </>
        ) : null}
      </Box>
    </Container>
  );
};

UserList.propTypes = {
  users: PropTypes.array,
};

export default UserList;
