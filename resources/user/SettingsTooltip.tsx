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
  RadioGroup,
  FormControl,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import DarkModeContext from "../DarkMode";
import Cookies from "js-cookie";
import { Socket } from "socket.io-client";

interface StyleProps {
  darkMode: boolean;
}

type Mode = "online" | "offline" | "idle" | "dnd";

interface SettingsTooltipProps {
  socket: SocketIOClient.Socket;
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
  online: {
    color: "green",
  },
  idle: {
    color: "yellow",
  },
  dnd: {
    color: "red",
  },
}));

const SettingsTooltip = ({
  handleTooltipClose,
  socket,
}: SettingsTooltipProps): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<Mode>(null!);
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
          setMode(data.mode as Mode);
        }
      });
  }, []);
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setStatus(e.target.value);
  };

  const handleRadio = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setMode(e.target.value as Mode);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetch("/user/status/update", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ status, mode }),
      headers: {
        "X-CSRF-TOKEN": Cookies.get("XSRF-TOKEN")!,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          socket.emit("status and mode updated", {
            status: data.status,
            mode: data.mode,
          });
          console.log("updated in seettingstooltip");
          setStatus(data.status);
          setMode(data.mode as Mode);
        }
      });
  };
  return (
    <Card classes={{ root: classes.card }}>
      <CardContent className={classes.content}>
        <form onSubmit={handleSubmit}>
          <FormControl>
            <RadioGroup value={mode} onChange={handleRadio}>
              <FormControlLabel
                label="Online"
                labelPlacement="start"
                value="online"
                control={<Radio className={classes.online} />}
              />
              <FormControlLabel
                label="Idle"
                labelPlacement="start"
                value="idle"
                control={<Radio className={classes.idle} />}
              />
              <FormControlLabel
                label="Do Not Disturb"
                labelPlacement="start"
                value="dnd"
                control={<Radio className={classes.dnd} />}
              />
            </RadioGroup>
          </FormControl>
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
