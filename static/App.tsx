import Cookies from "js-cookie";
import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch } from "react-router-dom";
import Chat from "./Chat";
import Login from "./Login";
import { makeStyles, Box, IconButton, Container } from "@material-ui/core";
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
          <Container>
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
          </Container>
          <IconButton onClick={toggleDarkMode} className={classes.button}>
            {darkMode ? (
              <MoonIcon className={classes.moon} />
            ) : (
              <SunIcon className={classes.sun} />
            )}
          </IconButton>
        </BrowserRouter>
      </DarkModeContext.Provider>
    </Box>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
