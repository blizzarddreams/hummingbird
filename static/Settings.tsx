import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  makeStyles,
} from "@material-ui/core";
import { Theme, fade, darken } from "@material-ui/core/styles";
import DarkModeContext from "./DarkMode";

interface SettingsData {
  username: string;
  email: string;
  oldPassword: string;
  newPassword: string;
  repeatNewPassword: string;
}

interface A11yProps {
  id: string;
  "aria-controls": string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

interface StyleProps {
  darkMode: boolean;
}
const useStyles = makeStyles((theme: Theme) => ({
  navBar: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#0a0e0c" : "#dff7eb",
    boxShadow: "0",
  }),
  navBarRoot: {
    boxShadow: "none",
  },
  tab: {
    width: "24rem",
    minWidth: "24rem",
  },
  settingsIcon: (props: StyleProps) => ({
    color: props.darkMode ? "#dff7eb" : "#0a0e0c",
  }),
  toolBar: {
    display: "flex",
    flexDirection: "row-reverse",
  },
  indicator: {
    backgroundColor: "#23f0c7",
  },
  button: {
    backgroundColor: "#23f0c7",
    width: "40%",
    "&:hover": {
      backgroundColor: darken("#23f0c7", 0.1),
    },
  },
  backButton: {
    backgroundColor: "#42e2b8",
    "&:hover": {
      backgroundColor: darken("#42e2b8", 0.1),
    },
  },
  input: {
    margin: theme.spacing(1),

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
    width: "40%",
    "&:focus": {
      borderColor: "#eee",
    },
  },
  box: {
    flexGrow: 1,
  },
}));

const a11yProps = (index: number): A11yProps => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const TabPanel = (props: TabPanelProps): JSX.Element => {
  const { children, value, index, ...other } = props;
  return (
    <Typography
      component="div"
      role="tabpanel"
      style={{ width: "100%" }}
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box p={4}>{children}</Box>}
    </Typography>
  );
};

const Settings = (): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  const [value, setValue] = useState(0);
  const [settings, setSettings] = useState<SettingsData>({
    username: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    repeatNewPassword: "",
  });

  const [errors, setErrors] = useState({
    username: [],
    email: [],
    oldPassword: [],
    newPassword: [],
    repeatNewPassword: [],
  });

  const handleSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const target = e.target.getAttribute("name")!;
    setSettings({ ...settings, [target]: e.target.value });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const data = JSON.stringify({
      oldPassword: settings.oldPassword,
      newPassword: settings.newPassword,
      repeatNewPassword: settings.repeatNewPassword,
    });
    fetch("/settings/password", {
      method: "POST",
      credentials: "include",
      body: data,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // todo
        } else {
          setErrors({ ...errors, ...data.errors });
        }
      });
  };

  const handleSettingsSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const data = JSON.stringify({
      username: settings.username,
      email: settings.email,
    });
    fetch("/settings/profile", {
      method: "POST",
      credentials: "include",
      body: data,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // todo
        } else {
          setErrors({ ...errors, ...data.errors });
        }
      });
  };

  useEffect(() => {
    fetch("/settings/default", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.user);
        }
      });
  }, []);

  const handleTabChange = (
    e: React.ChangeEvent<{}>,
    newValue: number,
  ): void => {
    setValue(newValue);
  };
  return (
    <Box display="flex">
      <Tabs
        value={value}
        onChange={handleTabChange}
        orientation="vertical"
        classes={{ indicator: classes.indicator }}
      >
        <Tab
          label="Username & Email"
          {...a11yProps(0)}
          classes={{ root: classes.tab }}
        />
        <Tab
          label="Password"
          {...a11yProps(1)}
          classes={{ root: classes.tab }}
        />
      </Tabs>

      <TabPanel value={value} index={0}>
        <form onSubmit={handleSettingsSubmit}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <TextField
              name="username"
              id="outlined-basic"
              label="Username"
              onChange={handleSettingsChange}
              value={settings.username}
              variant="outlined"
              error={errors.username.length > 0}
              helperText={errors.username.join("\n")}
              classes={{
                root: classes.input,
              }}
            />

            <TextField
              name="email"
              id="outlined-basic"
              label="E-Mail"
              onChange={handleSettingsChange}
              value={settings.email}
              error={errors.email.length > 0}
              helperText={errors.email.join("\n")}
              variant="outlined"
              classes={{
                root: classes.input,
              }}
            />

            <Button
              variant="contained"
              className={classes.button}
              type="submit"
            >
              Submit
            </Button>
          </Box>
        </form>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <form onSubmit={handlePasswordSubmit}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <TextField
              name="oldPassword"
              id="outlined-basic"
              label="Password"
              onChange={handleSettingsChange}
              value={settings.oldPassword}
              type={"password"}
              error={errors.oldPassword.length > 0}
              helperText={errors.oldPassword.join("\n")}
              variant="outlined"
              classes={{
                root: classes.input,
              }}
            />

            <TextField
              name="newPassword"
              id="outlined-basic"
              label="New Password"
              onChange={handleSettingsChange}
              value={settings.newPassword}
              error={errors.newPassword.length > 0}
              helperText={errors.newPassword.join("\n")}
              variant="outlined"
              classes={{
                root: classes.input,
              }}
            />

            <TextField
              name="repeatNewPassword"
              id="outlined-basic"
              label="Confirm New Password"
              onChange={handleSettingsChange}
              error={errors.repeatNewPassword.length > 0}
              helperText={errors.repeatNewPassword.join("\n")}
              value={settings.repeatNewPassword}
              variant="outlined"
              classes={{
                root: classes.input,
              }}
            />

            <Button
              variant="contained"
              className={classes.button}
              type="submit"
            >
              Submit
            </Button>
          </Box>
        </form>
      </TabPanel>
    </Box>
  );
};

export default Settings;
