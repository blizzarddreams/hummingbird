import React, { useState, useEffect, useContext } from "react";
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
import DarkModeContext from "../DarkMode";
import Cookies from "js-cookie";

interface StyleProps {
  darkMode: boolean;
}

interface SettingsTooltipProps {
  handleTooltipClose: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: (props: StyleProps) => ({
    color: props.darkMode ? "#dff7eb" : "#0a0e0c",
    backgroundColor: props.darkMode ? "#0a0e0c" : "#dff7eb",
  }),

  input: {
    //width: "40%",
    marginBottom: theme.spacing(1),
    "& .MuiFormLabel-root": {
      color: (props: StyleProps): string => (props.darkMode ? "#eee" : "#222"),
    },
    "& .MuiOutlinedInput-root": {
      color: (props: StyleProps): string => (props.darkMode ? "#eee" : "#222"),
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
    "&:hover": {
      backgroundColor: darken("#23f0c7", 0.1),
    },
  },
  content: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
}));

const SettingsTooltip = ({
  handleTooltipClose,
}: SettingsTooltipProps): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const [status, setStatus] = useState("");
  const classes = useStyles({ darkMode });

  useEffect(() => {
    fetch("/user/status/default", {
      headers: {
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
      },
    })
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
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStatus(data.status);
      });
  };
  return (
    <Card classes={{ root: classes.card }}>
      <CardContent className={classes.content}>
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
          <Button
            type="submit"
            className={classes.button}
            fullWidth
            onClick={handleTooltipClose}
          >
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsTooltip;
