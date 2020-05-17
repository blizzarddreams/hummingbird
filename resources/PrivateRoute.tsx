import React from "react";
import { Route, Redirect } from "react-router-dom";
import PropType from "prop-types";
import Cookies from "js-cookie";

interface PrivateRouteProps {
  children: React.ReactNode;
  path: string;
}
const PrivateRoute = ({
  children,
  ...rest
}: PrivateRouteProps): JSX.Element => {
  return (
    <Route
      {...rest}
      render={({ location }): JSX.Element | React.ReactNode =>
        Cookies.get("email") ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

PrivateRoute.propTypes = {
  children: PropType.element,
};

export default PrivateRoute;
