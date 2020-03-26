import passport from "passport";
import passportLocal from "passport-local";
import passportGoogle from "passport-google-oauth20";
import passportGithub from "passport-github";
import bcrypt from "bcrypt";
import { User } from "./models";

const GithubStrategy = passportGithub.Strategy;
const GoogleStrategy = passportGoogle.Strategy;
const LocalStrategy = passportLocal.Strategy;

passport.use(
  new LocalStrategy((username: string, password: string, done) => {
    User.findOne({ username }).then((user: User | undefined) => {
      if (!user) return done(null, false);
      bcrypt.compare(password, user.password, (err, res) => {
        if (!res) return done(null, false);
        return done(null, user);
      });
    });
  }),
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: process.env.GITHUB_CLIENT_URL,
      scope: ["user:email"],
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOrCreateGithub(profile, (user: User) => cb(undefined, user));
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CLIENT_URL as string,
      scope: ["openid profile email"],
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOrCreateGoogle(profile, (user: User) => cb(undefined, user));
    },
  ),
);

passport.serializeUser((user: User, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  const user = await User.findOne(id as string);
  return done(null, user);
});

export default passport;
