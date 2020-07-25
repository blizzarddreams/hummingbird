import Cookies from "js-cookie";
import React, { useState, useContext } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import {
  IconButton,
  AppBar,
  Toolbar,
  Tooltip,
  makeStyles,
  ClickAwayListener,
  Box,
  Hidden,
  Dialog,
  DialogContent,
} from "@material-ui/core";

import {
  Settings as SettingsIcon,
  ExitToApp as LogOutIcon,
  ArrowBack as ArrowIcon,
  List as ListIcon,
  People as PeopleIcon,
} from "@material-ui/icons";

import Gravatar from "./util/Gravatar";
import SettingsTooltip from "./user/SettingsTooltip";
import DarkModeContext from "./DarkMode";

interface StyleProps {
  darkMode: boolean;
}

interface NavbarProps {
  socket: SocketIOClient.Socket;
  toggleChannelList: (e: React.MouseEvent<HTMLButtonElement>) => void;
  toggleUserList: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const useStyles = makeStyles(() => ({
  navBar: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#0a0e0c" : "#dff7eb",
    boxShadow: "0",
  }),
  navBarRoot: {
    boxShadow: "none",
    height: "10%!important",
  },
  icons: (props: StyleProps) => ({
    color: props.darkMode ? "#dff7eb" : "#0a0e0c",
  }),
  toolBar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    position: "absolute",
    bottom: "4rem",
    right: 0,
  },
  tooltip: {
    padding: "0",
  },
}));

const Navbar = ({
  toggleChannelList,
  socket,
  toggleUserList,
}: NavbarProps): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles({ darkMode });
  const [open, setOpen] = useState(false);

  const handleTooltipOpen = (): void => setOpen(true);

  const handleTooltipClose = (): void => setOpen(false);

  const handleLogOut = (): void => {
    fetch("/logout", {
      headers: {
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          history.push("/");
        }
      });
  };
  return (
    <AppBar
      position={"static"}
      className={classes.navBar}
      classes={{ root: classes.navBarRoot }}
    >
      <Toolbar className={classes.toolBar}>
        <Box>
          {location.pathname === "/settings" ? (
            <IconButton className={classes.icons}>
              <ArrowIcon onClick={(): void => history.goBack()} />
            </IconButton>
          ) : null}
          <Hidden smUp>
            {location.pathname === "/app" ? (
              <>
                <IconButton className={classes.icons} onClick={toggleUserList}>
                  <PeopleIcon />
                </IconButton>
                <IconButton
                  className={classes.icons}
                  onClick={toggleChannelList}
                >
                  <ListIcon />
                </IconButton>
              </>
            ) : null}
          </Hidden>
        </Box>
        <Box>
          {Cookies.get("email") ? (
            <Box display="flex" flexDirection="row-reverse" alignItems="center">
              <Dialog open={open} onClose={handleTooltipClose}>
                <SettingsTooltip
                  handleTooltipClose={handleTooltipClose}
                  socket={socket}
                />
              </Dialog>
              <Box
                display="flex"
                alignItems="center"
                onClick={handleTooltipOpen}
              >
                <IconButton onClick={handleTooltipOpen}>
                  <Gravatar email={Cookies.get("email")!} size={4} />
                </IconButton>
              </Box>
              <Link to={"/settings"}>
                <IconButton className={classes.icons}>
                  <SettingsIcon />
                </IconButton>
              </Link>
              <IconButton onClick={handleLogOut} className={classes.icons}>
                <LogOutIcon />
              </IconButton>
            </Box>
          ) : null}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
