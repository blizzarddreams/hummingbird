import express from "express";
import bcrypt from "bcrypt";
import randomcolor from "randomcolor";
import passport from "passport";
import { validate } from "class-validator";
import { User } from "./models";

const router = express.Router();

interface RequestUser {
  username: string;
}

router.get("/", (req, res) => {
  if (req.user) {
    res.render("hummingbird");
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
  user.color = randomcolor({ hue: "blue" });
  validate(user, { validationError: { target: false } }).then(
    async (errors) => {
      if (errors.length > 0) {
        const errorsList = errors.flatMap((x) => {
          return Object.values(x.constraints);
        });
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
          console.log(e);
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

router.get("/settings", (req, res) =>
  res.render("settings", { username: (req.user as RequestUser).username }),
);

router.post("/settings", async (req, res) => {
  const user = await User.findOne({
    username: (req.user as RequestUser).username,
  });
  const oldPassword = req.body["old-password"].trim();
  const newPassword = req.body["new-password"].trim();
  const newPasswordConfirm = req.body["new-password-confirm"].trim();
  const arePasswordsNotEmpty: boolean = [
    oldPassword,
    newPassword,
    newPasswordConfirm,
  ].every((password) => {
    return password.length !== 0;
  });
  if (arePasswordsNotEmpty) {
    bcrypt.compare(oldPassword, user.password, (err, res_) => {
      if (err) return err;
      if (!res_) return err;
      if (newPassword === newPasswordConfirm) {
        bcrypt.hash(newPassword, 10, async (err_, hash) => {
          if (err_) return err_;
          user.password = hash;
          await user.save();
          return res.redirect("/settings");
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
