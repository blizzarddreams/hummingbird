import React, { useContext } from "react";
import { createHash } from "crypto";
import { Avatar, Badge } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faSpinner,
  faMoon,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import DarkModeContext from "../DarkMode";
interface StyleProps {
  size: number;
  darkMode: boolean;
}

interface GravatarProps {
  email: string;
  size: number;
  userlist?: boolean;
  mode?: string;
  typing?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  avatar: (props: StyleProps) => ({
    height: theme.spacing(props.size),
    width: theme.spacing(props.size),
  }),
  online: {
    color: "#02C39A",
  },
  idle: {
    color: "#517d83", // "#edfc3c", //"#508991",
  },
  dnd: {
    color: "#ef4545",
  },
  badgeBackground: (props: StyleProps) => ({
    backgroundColor: props.darkMode ? "#0a0e0c" : "#dff7eb",
    padding: "2px",
    borderRadius: "50%",
  }),
}));

const Gravatar = ({
  email,
  size,
  userlist,
  mode,
  typing,
}: GravatarProps): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const hash: string = createHash("md5")
    .update(email || "")
    .digest("hex");
  const classes = useStyles({ size, darkMode });
  let statusTitle;
  let statusBadgeClass;
  let statusBadgeIcon;
  if (userlist) {
    switch (mode) {
      case "online":
        statusTitle = "Online";
        statusBadgeClass = classes.online;
        statusBadgeIcon = faCircle;
        break;
      case "idle":
        statusTitle = "Idle";
        statusBadgeClass = classes.idle;
        statusBadgeIcon = faMoon;
        break;
      case "dnd":
        statusTitle = "Do Not Disturb";
        statusBadgeClass = classes.dnd;
        statusBadgeIcon = faTimesCircle;
    }
  }
  return (
    <>
      {userlist ? (
        <Badge
          overlap="circle"
          title={statusTitle}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            typing ? (
              <FontAwesomeIcon
                icon={faSpinner}
                className={`${statusBadgeClass} ${classes.badgeBackground}`}
                spin
              />
            ) : (
              <FontAwesomeIcon
                icon={statusBadgeIcon as IconDefinition}
                className={`${statusBadgeClass} ${classes.badgeBackground}`}
              />
            )
          }
        >
          <Avatar
            src={`https://www.gravatar.com/avatar/${hash}?s=200`}
            className={classes.avatar}
          />
        </Badge>
      ) : (
        <Avatar
          src={`https://www.gravatar.com/avatar/${hash}?s=200`}
          className={classes.avatar}
        />
      )}
    </>
  );
};

Gravatar.propTypes = {
  email: PropTypes.string,
  size: PropTypes.number,
};

export default Gravatar;
