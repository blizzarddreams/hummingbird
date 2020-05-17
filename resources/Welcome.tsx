import React from "react";
import {
  makeStyles,
  Theme,
  Typography,
  Button,
  darken,
  Box,
} from "@material-ui/core";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    backgroundColor: "#23f0c7",
    margin: theme.spacing(1),
    "&:hover": {
      backgroundColor: darken("#23f0c7", 0.1),
    },
  },
  title: {
    "&::first-letter": {
      color: "#23f0c7",
    },
  },
}));

const Welcome = (): JSX.Element => {
  const classes = useStyles();

  return (
    <Box textAlign="center">
      <Typography variant="h2" className={classes.title}>
        Hummingbird
      </Typography>
      <Link to="/login">
        <Button variant="contained" className={classes.button}>
          Login
        </Button>
      </Link>
      <Link to="/register">
        <Button variant="contained" className={classes.button}>
          Register
        </Button>
      </Link>
    </Box>
  );
};

export default Welcome;
