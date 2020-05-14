import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import {
  IconButton,
  AppBar,
  Toolbar,
  Tooltip,
  makeStyles,
  ClickAwayListener,
  Box,
} from "@material-ui/core";

import {
  Settings as SettingsIcon,
  ExitToApp as LogOutIcon,
  ArrowBack as ArrowIcon,
} from "@material-ui/icons";

import Gravatar from "./Gravatar";
import SettingsTooltip from "./SettingsTooltip";

const useStyles = makeStyles(() => ({
  navBar: (props: { darkTheme: boolean }) => ({
    backgroundColor: props.darkTheme ? "#0a0e0c" : "#dff7eb",
    boxShadow: "0",
  }),
  navBarRoot: {
    boxShadow: "none",
    height: "10%!important",
  },
  icons: (props: { darkTheme: boolean }) => ({
    color: props.darkTheme ? "#dff7eb" : "#0a0e0c",
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

const Navbar = ({ darkTheme }: { darkTheme: boolean }): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles({ darkTheme });
  //const [email, setEmail] = useState(Cookies.get());
  const [open, setOpen] = useState(false);

  const handleTooltipOpen = (): void => setOpen(true);

  const handleTooltipClose = (): void => setOpen(false);
  const handleLogOut = (): void => {
    fetch("/logout")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          //setEmail("");
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
        </Box>
        <Box>
          {Cookies.get("email") ? (
            <Box display="flex" flexDirection="row-reverse">
              <ClickAwayListener onClickAway={handleTooltipClose}>
                <Tooltip
                  classes={{ tooltip: classes.tooltip }}
                  title={<SettingsTooltip darkTheme={darkTheme} />}
                  interactive={true}
                  open={open}
                  onClose={handleTooltipClose}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    onClick={handleTooltipOpen}
                  >
                    <Gravatar email={Cookies.get("email")!} size={4} />
                  </Box>
                </Tooltip>
              </ClickAwayListener>
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
