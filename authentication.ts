import passport from "passport";
import passportLocal from "passport-local";
import passportGoogle from "passport-google-oauth20";
import passportGithub from "passport-github2";
import bcrypt from "bcrypt";
import { Strategy as JwtStrategy } from "passport-jwt";
import { User } from "./models";
import { Request } from "express";
import { validate } from "class-validator";

const GithubStrategy = passportGithub.Strategy;
const GoogleStrategy = passportGoogle.Strategy;
const LocalStrategy = passportLocal.Strategy;

interface GithubProfile extends passportGithub.Profile {
  emails: [
    {
      value: string;
    },
  ];
  id: string;
  username: string;
  displayName: string;
}

interface Errors {
  [key: string]: string[];
}

interface GoogleProfile extends passportGoogle.Profile {
  emails?: { value: string; type?: string | undefined }[] | undefined;
  id: string;
  username?: string;
  displayName: string;
}

const options = {
  jwtFromRequest: (req: Request): string => req.cookies.token,
  secretOrKey: process.env.JWT_SECRET_KEY!,
};

function register(
  username: string,
  password: string,
  email: string,
  next: {
    (err: Errors | null, user: User | undefined): void;
  },
): void {
  const user: User = new User();
  user.username = username;
  user.password = password;
  user.email = email;
  validate(user, { validationError: { target: false } }).then(
    async (errors) => {
      if (errors.length > 0) {
        const errorList: Errors = {}; //errors.flatMap((x) => Object.values(x.constraints));
        errors.map((error) => {
          errorList[error.property] = Object.values(error.constraints);
        });
        return next(errorList, undefined);
      }
      bcrypt.hash(password, 10, async (_err, hash) => {
        user.password = hash;
        await user.save();
        return next(null, user);
      });
    },
  );
}

passport.use(
  new JwtStrategy(options, async (jwtPayload, done) => {
    const user: User | undefined = await User.findOne({ id: jwtPayload.id });
    if (!user) {
      done(null, false);
    } else {
      done(null, user);
    }
  }),
);

passport.use(
  new LocalStrategy((username: string, password: string, done) => {
    User.findOne({ username }).then((user: User | undefined) => {
      if (!user) return done(null, false);
      bcrypt.compare(password, user.password, (_err, res) => {
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
      callbackURL: process.env.GITHUB_CLIENT_URL as string,
      scope: ["user"],
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: GithubProfile,
      verified: (arg0: undefined, arg1: User) => void,
    ) => {
      User.findOrCreateGithub(profile, (user: User) =>
        verified(undefined, user),
      );
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
    (accessToken, refreshToken, profile: GoogleProfile, cb) => {
      User.findOrCreateGoogle(profile, (user: User) => cb(undefined, user));
    },
  ),
);

passport.serializeUser((user: User, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  const user = await User.findOne(id as string);
  return done(null, user);
});

export { passport, register };
