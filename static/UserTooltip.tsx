import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Theme,
  Card,
  fade,
  CardContent,
  Box,
  darken,
  Typography,
} from "@material-ui/core";
import Gravatar from "./Gravatar";
import Moment from "./Moment";
import { CalendarToday as CalendarIcon } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) => ({
  card: (props: { darkTheme: boolean }) => ({
    color: props.darkTheme ? "#dff7eb" : "#0a0e0c",
    backgroundColor: props.darkTheme ? "#dff7eb" : "#0a0e0c",
  }),

  box: (props: { darkTheme: boolean }) => ({
    color: `${props.darkTheme ? "#0a0e0c" : "#dff7eb"}!important`,
    //backgroundColor: props.darkTheme ? "#dff7eb" : "#0a0e0c",
  }),

  input: {
    margin: theme.spacing(1),
    //width: "40%",
    "& .MuiFormLabel-root": {
      color: (props: { darkTheme: boolean }): string =>
        props.darkTheme ? "#222" : "#eee",
    },
    "& .MuiOutlinedInput-root": {
      color: (props: { darkTheme: boolean }): string =>
        props.darkTheme ? "#222" : "#eee",
      backgroundColor: fade("#66d0f9", 0.1),
      borderRadius: theme.shape.borderRadius,

      "&.Mui-focused fieldset": {
        borderColor: "#23f0c7",
      },
    },
    "& .MuiFormHelperText-root": {
      fontWeight: "bold",
    },
    "&:focus": {
      borderColor: "#eee",
    },
  },
  button: {
    backgroundColor: "#23f0c7",
    marginBottom: theme.spacing(1),
    "&:hover": {
      backgroundColor: darken("#23f0c7", 0.1),
    },
  },
}));

const UserTooltip = ({
  darkTheme,
  username,
}: {
  darkTheme: boolean;
  username: string;
}): JSX.Element => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    createdAt: "",
    status: "",
    color: "",
  });

  useEffect(() => {
    fetch(`/user/status?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser({ ...data.user });
        }
      });
  }, []);

  const classes = useStyles({ darkTheme });
  return (
    <Card classes={{ root: classes.card }}>
      <CardContent>
        <Box
          display="flex"
          //flexDirection="column"
          flexDirection="column"
          //alignItems="center"
          // style={{ width: "100%" }}
        >
          <Gravatar email={user.email} size={6} />
          <Box className={classes.box}>
            <Typography
              variant="h5"
              style={{ color: user.color, fontWeight: "bold" }}
            >
              {user.username}
            </Typography>
            <Typography variant="body2">
              <CalendarIcon /> Registered{" "}
              <Moment time={user.createdAt} tooltip={true} />
            </Typography>
            <Typography variant="body1">{user.status}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserTooltip;
