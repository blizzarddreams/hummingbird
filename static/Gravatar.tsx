import React from "react";
import { createHash } from "crypto";
import { Avatar } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import PropTypes from "prop-types";
interface GravatarProps {
  size: number;
}
const useStyles = makeStyles((theme: Theme) => ({
  avatar: (props: GravatarProps) => ({
    height: theme.spacing(props.size),
    width: theme.spacing(props.size),
  }),
}));
interface GravatarProps {
  email: string;
  size: number;
}
const Gravatar = ({ email, size }: GravatarProps): JSX.Element => {
  const hash: string = createHash("md5")
    .update(email || "")
    .digest("hex");
  const classes = useStyles({ size, email });

  return (
    <Avatar
      src={`https://www.gravatar.com/avatar/${hash}?s=200`}
      className={classes.avatar}
    />
  );
};

Gravatar.propTypes = {
  email: PropTypes.string,
  size: PropTypes.number,
};

export default Gravatar;
