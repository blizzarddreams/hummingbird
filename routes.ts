import express from "express";
import bcrypt from "bcrypt";
import randomcolor from "randomcolor";
import passport from "passport";
import { validate, ValidationError } from "class-validator";
import { User } from "./models";
import jwt from "jsonwebtoken";

const router = express.Router();

interface Errors {
  [key: string]: string[];
}
interface RequestUser {
  username: string;
  id: string;
  email: string;
}

interface SettingsError extends ValidationError {
  constraints: {};
}

router.post("/login", passport.authenticate("local"), (req, res) => {
  const token = jwt.sign(
    { id: (req.user as RequestUser).id },
    process.env.JWT_SECRET_KEY as string,
  );
  res.cookie("token", token, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
    secure: false,
    httpOnly: true,
  });
  res.cookie("email", (req.user as RequestUser).email, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
    secure: false,
    httpOnly: false,
  });

  return res.json({
    success: true,
    token,
    email: (req.user as RequestUser).email,
  });
});

router.get("/user/get-id", passport.authenticate("jwt"), (req, res) => {
  if (!req.user) return false;
  return res.json({ success: true, id: (req.user as RequestUser).id });
});

router.get("/settings/default", async (req, res) => {
  if (!req.user) return false;
  const user: User | undefined = await User.findOne(
    (req.user as RequestUser).id,
  );
  if (!user) return false;
  return res.json({ success: true, user });
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  },
);

router.post("/register", (req, res) => {
  const user = new User();
  const errorList: Errors = {};
  user.password = req.body.password;
  user.username = req.body.username;
  user.email = req.body.email;
  user.color = randomcolor();
  validate(user, { validationError: { target: false } }).then(
    async (errors: SettingsError[]) => {
      if (errors.length > 0) {
        errors.map((error) => {
          errorList[error.property] = Object.values(error.constraints);
        });
        return res.json({ success: false, errors: errorList });
      }

      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if (err) return false;
        user.password = hash;
        try {
          await user.save();
          return res.json({ success: true });
        } catch (e) {
          if (e.name === "QueryFailedError") {
            const [field, takenField] = e.detail.match(
              /(?!\()([A-Za-z@.]+)(?=\))/g,
            );
            errorList[field] = [`${field} ${takenField} is already taken.`];
            return res.json({ success: false, errors: errorList }); // todo fix
          }
        }
      });
    },
  );
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
  res.clearCookie("token");
  res.clearCookie("email");
  return res.json({ success: true });
});

router.post("/settings/password", async (req, res) => {
  const errorList: Errors = {};
  const user: User | undefined = await User.findOne(
    (req.user as RequestUser).id,
  );
  if (!user) return false;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const repeatNewPassword = req.body.repeatNewPassword;
  const longerThan8Characters: boolean = [
    oldPassword,
    newPassword,
    repeatNewPassword,
  ].every((x) => x.length >= 8);
  if (longerThan8Characters) {
    bcrypt.compare(oldPassword, user.password, (err, res_) => {
      if (!res_) {
        errorList.oldPassword = ["invalid password"];
        return res.json({ success: false, errors: errorList });
      }
      if (newPassword === repeatNewPassword) {
        bcrypt.hash(newPassword, 10, async (err_, hash) => {
          if (err) return false;
          user.password = hash;
          await user.save();
          return res.json({ success: true });
        });
      } else {
        errorList.newPassword = ["passwords do not match"];
        return res.json({ success: false, errors: errorList });
      }
    });
  } else {
    return res.json({ success: false }); //todo fix
  }
});

router.get("/user/status", async (req, res) => {
  const user: User | undefined = await User.createQueryBuilder("user")
    .where("user.username ILIKE :username", { username: req.query.username })
    .select([
      "user.status",
      "user.email",
      "user.createdAt",
      "user.username",
      "user.color",
    ])
    .getOne();

  if (!user) return false;
  return res.json({ success: true, user });
});

router.post(
  "/user/status/update",
  passport.authenticate("jwt"),
  async (req, res) => {
    const user: User | undefined = await User.findOne(
      (req.user as RequestUser).id,
    );
    if (!user) return false;
    user.status = req.body.status;
    await user.save();
    return res.json({ success: true, status: req.body.status });
  },
);

router.get(
  "/user/status/default",
  passport.authenticate("jwt"),
  async (req, res) => {
    const user: User | undefined = await User.findOne(
      (req.user as RequestUser).id,
    );
    if (!user) return false;
    return res.json({ success: true, status: user.status });
  },
);
router.post(
  "/settings/profile",
  passport.authenticate("jwt"),
  async (req, res) => {
    const errorList: Errors = {};
    const user: User | undefined = await User.findOne(
      (req.user as RequestUser).id,
    );
    if (!user) return false;
    user.username = req.body.username.trim();
    user.email = req.body.email.trim();
    validate(user, { validationError: { target: false } }).then(
      async (errors: SettingsError[]) => {
        if (errors.length > 0) {
          errors.map((error) => {
            errorList[error.property] = Object.values(error.constraints);
            return res.json({ success: false, errors: errorList });
          });
        } else {
          try {
            await user.save();
            return res.json({ success: true });
          } catch (e) {
            if (e.name === "QueryFailedError") {
              const [field, takenField] = e.detail.match(
                /(?!\()([A-Za-z@.]+)(?=\))/g,
              );
              errorList[field] = [`${field} ${takenField} is already taken.`];
              return res.json({ success: false, errors: errorList });
            }
          }
        }
      },
    );
  },
);

router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: (req.user as RequestUser).id },
      process.env.JWT_SECRET_KEY as string,
    );
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
      secure: false,
      httpOnly: true,
    });
    res.cookie("email", (req.user as RequestUser).email, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
      secure: false,
      httpOnly: false,
    });

    /* return res.json({
      success: true,
      token,
      email: (req.user as RequestUser).email,
    });*/
    return res.redirect("/");
  },
);

router.get("/auth/google", passport.authenticate("google"));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: (req.user as RequestUser).id },
      process.env.JWT_SECRET_KEY as string,
    );
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
      secure: false,
      httpOnly: true,
    });
    res.cookie("email", (req.user as RequestUser).email, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 * 1),
      secure: false,
      httpOnly: false,
    });

    return res.redirect("/");
  },
);

export default router;
