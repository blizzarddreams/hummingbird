import express from "express";
import bcrypt from "bcrypt";
import randomcolor from "randomcolor";
import passport from "passport";
import { validate, ValidationError } from "class-validator";
import { User } from "./models";

const router = express.Router();

interface RequestUser {
  username: string;
}

interface SettingsError extends ValidationError {
  constraints: {};
}

router.get("/", (req, res) => {
  if (req.user) {
    res.render("app");
  } else {
    res.render("home", { auth: req.user });
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  },
);

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  const user = new User();
  user.password = req.body.password;
  user.username = req.body.username;
  user.email = req.body.email;
  user.color = randomcolor();
  validate(user, { validationError: { target: false } }).then(
    async (errors) => {
      if (errors.length > 0) {
        const errorsList = errors.flatMap((x) => Object.values(x.constraints));
        req.flash("errors", errorsList);
        return res.redirect("/register");
      }
      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if (err) return false;
        user.password = hash;
        try {
          await user.save();
          return res.redirect("/");
        } catch (e) {
          if (e.name === "QueryFailedError") {
            const errorMessage: string = e.detail
              .split("=")[1]
              .replace(/()/g, "");
            req.flash("errors", [errorMessage]);
          }
          return res.redirect("/register");
        }
      });
    },
  );
});

router.post("/authenticated", (req, res) => {
  if (req.user) {
    return res.json({
      auth: true,
      username: (req.user as RequestUser).username,
    });
  }
  return res.json({ auth: false });
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  },
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/settings", (req, res) => {
  res.render("settings", { username: (req.user as RequestUser).username });
});

router.post("/settings", async (req, res) => {
  const user: User = (await User.findOne({
    username: (req.user as RequestUser).username,
  })) as User;
  const username = req.body.username.trim();
  const oldPassword = req.body["old-password"].trim();
  const newPassword = req.body["new-password"].trim();
  const newPasswordConfirm = req.body["new-password-confirm"].trim();
  const arePasswordsEmpty: boolean = [
    oldPassword,
    newPassword,
    newPasswordConfirm,
  ].every((password) => password.length >= 8);
  // if username exists, check to see if it is valid.
  // if username is not valid, then redirect to settings.
  // if it is, but passwords are not empty, only update the username.
  // if it is, and the passwords are empty, then update the username, and save the user.
  if (username.length >= 1) {
    user.username = username;
    validate(user, { validationError: { target: false } }).then(
      async (errors: SettingsError[]) => {
        if (errors.length > 0) {
          const errorsList: string[] = errors.flatMap((x) =>
            Object.values(x.constraints),
          );
          req.flash("errors", errorsList);
          return res.redirect("/settings");
        }
        if (arePasswordsEmpty) {
          try {
            await user.save();
            return res.redirect("/");
          } catch (e) {
            if (e.name === "QueryFailedError") {
              const errorMessage: string = e.detail
                .split("=")[1]
                .replace(/()/g, "");
              return req.flash("errors", [errorMessage]);
            }
            return res.redirect("/settings");
          }
        }
      },
    );
  }
  if (!arePasswordsEmpty) {
    bcrypt.compare(oldPassword, user.password, (err, res_) => {
      if (err) return res.redirect("/settings");
      if (!res_) return res.redirect("/settings");
      if (newPassword === newPasswordConfirm) {
        bcrypt.hash(newPassword, 10, async (err_, hash) => {
          if (err_) return res.redirect("/settings");
          user.password = hash;
          try {
            await user.save();
            return res.redirect("/");
          } catch (e) {
            if (e.name === "QueryFailedError") {
              const errorMessage: string = e.detail
                .split("=")[1]
                .replace(/()/g, "");
              req.flash("errors", [errorMessage]);
            }
            return res.redirect("/register");
          }
        });
      }
    });
  }
});

router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  },
);

router.get("/auth/google", passport.authenticate("google"));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  },
);

export default router;
