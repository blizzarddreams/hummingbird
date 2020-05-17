import React from "react";
import moment from "moment";
import { Tooltip } from "@material-ui/core";

interface MomentProps {
  time: string;
  tooltip: boolean;
}
const Moment = ({ time, tooltip }: MomentProps): JSX.Element => {
  const timeFormatted = moment(time).format("hh:mm:ss: - MMMM DD YYYY");
  let date: string = moment(time).local().format("HH:mm:ss");
  if (tooltip) {
    date = moment(time).local().format("MMMM YYYY");
  }
  return (
    <Tooltip className={"grey"} title={timeFormatted} arrow interactive>
      <span>{date}</span>
    </Tooltip>
  );
};
Moment.defaultProps = {
  tooltip: false,
};

export default Moment;
