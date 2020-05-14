import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Theme,
  Card,
  fade,
  CardContent,
  Box,
  TextField,
  darken,
  Button,
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
  card: (props: { darkTheme: boolean }) => ({
    color: props.darkTheme ? "#dff7eb" : "#0a0e0c",
    backgroundColor: props.darkTheme ? "#dff7eb" : "#0a0e0c",
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

const SettingsTooltip = ({
  darkTheme,
}: {
  darkTheme: boolean;
}): JSX.Element => {
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/user/status/default")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus(data.status);
        }
      });
  }, []);
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setStatus(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetch("/user/status/update", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ status }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStatus(data.status);
      });
  };
  const classes = useStyles({ darkTheme });
  return (
    <Card classes={{ root: classes.card }}>
      <CardContent style={{ width: "100%" }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          style={{ width: "100%" }}
        >
          <form onSubmit={handleSubmit}>
            <TextField
              name="Status"
              id="outlined-basic"
              fullWidth
              label="Status"
              onChange={handleStatusChange}
              value={status}
              variant="outlined"
              classes={{
                root: classes.input,
              }}
            />
            <Button type="submit" className={classes.button}>
              Save
            </Button>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SettingsTooltip;
