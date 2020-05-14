import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch } from "react-router-dom";
import Chat from "./Chat";
import Login from "./Login";
import { makeStyles, Box, IconButton } from "@material-ui/core";
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

interface AppProps {
  darkTheme: boolean;
}

const useStyles = makeStyles(() => ({
  container: (props: AppProps) => ({
    backgroundColor: props.darkTheme ? "#0a0e0c" : "#dff7eb",
    color: props.darkTheme ? "#dff7eb" : "#0a0e0c",
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
  const [darkTheme, setDarkTheme] = useState(
    Cookies.get("darkTheme") === "true" ? true : false,
  );

  const [, setAuth] = useState(""); //Cookies.get("email"));

  useEffect(() => {
    setAuth(Cookies.get("email") || "");
  }, []);

  const toggleDarkTheme = (): void => {
    const darkThemeCurrentValue = Cookies.get("darkTheme");
    Cookies.set(
      "darkTheme",
      darkThemeCurrentValue === "true" ? "false" : "true",
    );
    setDarkTheme(!darkTheme);
  };

  const classes = useStyles({ darkTheme });
  return (
    <Box className={classes.container}>
      <BrowserRouter>
        <Navbar darkTheme={darkTheme} />
        <Switch>
          <PrivateRoute path="/app">
            <Chat darkTheme={darkTheme} />
          </PrivateRoute>
          <GuestRoute path="/login">
            <Login darkTheme={darkTheme} />
          </GuestRoute>
          <PrivateRoute path="/settings">
            <Settings darkTheme={darkTheme} />
          </PrivateRoute>
          <GuestRoute path="/register">
            <Register darkTheme={darkTheme} />
          </GuestRoute>
          <GuestRoute path="/">
            <Welcome darkTheme={darkTheme} />
          </GuestRoute>
        </Switch>
        <IconButton onClick={toggleDarkTheme} className={classes.button}>
          {darkTheme ? (
            <MoonIcon className={classes.moon} />
          ) : (
            <SunIcon className={classes.sun} />
          )}
        </IconButton>
      </BrowserRouter>
    </Box>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
