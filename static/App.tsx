import Cookies from "js-cookie";
import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch } from "react-router-dom";
import Chat from "./Chat";
import Login from "./Login";
import {
  makeStyles,
  Box,
  IconButton,
  Container,
  Fab,
  darken,
} from "@material-ui/core";
import {
  Brightness2 as MoonIcon,
  Brightness5 as SunIcon,
} from "@material-ui/icons";
import Navbar from "./Navbar";
import Settings from "./Settings";
import Welcome from "./Welcome";
import Register from "./Register";
import PrivateRoute from "./PrivateRoute";
import GuestRoute from "./GuestRoute";
import DarkModeContext from "./DarkMode";

interface StyleProps {
  darkMode: boolean;
}

const useStyles = makeStyles(() => ({
  container: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#0a0e0c" : "#dff7eb",
    color: props.darkMode ? "#dff7eb" : "#0a0e0c",
    height: "100% !important",
  }),
  moon: {
    color: "#dff7eb",
  },
  sun: {
    color: "#0a0e0c",
  },
  button: {
    position: "absolute",
    bottom: "4rem",
    right: 0,
  },
  darkModeButton: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#dff0f7" : "#080b17",
    position: "fixed",
    right: 0,
    bottom: "4rem !important",
    margin: "2rem !important",
    color: props.darkMode ? "#080b17" : "#dff0f7",
    "&:hover": {
      backgroundColor: darken(props.darkMode ? "#dff0f7" : "#080b17", 0.1),
    },
  }),
}));

const App = (): JSX.Element => {
  const [darkMode, setDarkMode] = useState(
    Cookies.get("darkMode") === "true" ? true : false,
  );

  const toggleDarkMode = (): void => {
    const darkThemeCurrentValue = Cookies.get("darkMode");
    Cookies.set(
      "darkMode",
      darkThemeCurrentValue === "true" ? "false" : "true",
    );
    setDarkMode(!darkMode);
  };

  const classes = useStyles({ darkMode });
  return (
    <Box className={classes.container}>
      <DarkModeContext.Provider value={darkMode}>
        <BrowserRouter>
          <Navbar />
          <Switch>
            <PrivateRoute path="/app">
              <Chat />
            </PrivateRoute>
            <GuestRoute path="/login">
              <Login />
            </GuestRoute>
            <PrivateRoute path="/settings">
              <Settings />
            </PrivateRoute>
            <GuestRoute path="/register">
              <Register />
            </GuestRoute>
            <GuestRoute path="/">
              <Welcome />
            </GuestRoute>
          </Switch>
        </BrowserRouter>
      </DarkModeContext.Provider>
      <Fab className={classes.darkModeButton} onClick={toggleDarkMode}>
        {darkMode ? <MoonIcon /> : <SunIcon />}
      </Fab>
    </Box>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
