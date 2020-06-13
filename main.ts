import "reflect-metadata";
import body from "body-parser";
import redisStore from "connect-redis";
import cookie from "cookie-parser";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import http from "http";
import redis from "redis";
import flash from "express-flash";
import csurf from "csurf";
import socketio from "socket.io";
import cors from "cors";
import { passport } from "./authentication";
import router from "./routes";
import websocket from "./websocket";
import path from "path";
import { createConnection } from "typeorm";

createConnection().then(() => {
  const app = express();
  const server = http.createServer(app);
  const client = redis.createClient(process.env.REDIS_URL || "");

  const RedisStore = redisStore(session);

  app.use("/", express.static("dist"));
  app.use(
    session({
      store: new RedisStore({ client }),
      secret: process.env.SECRET_KEY as string,
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(body.json());
  app.use(body.urlencoded({ extended: true }));
  app.use(cookie());
  app.use(csurf({ cookie: true }));
  app.use(helmet());
  app.use(cors());
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use("/", router);
  app.get("*", (req, res) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    res.sendFile(path.join(__dirname, "/views/index.html"));
  });

  const io = socketio(server);
  websocket(io);

  const port = process.env.PORT || 5000;
  server.listen(port, () => console.log(`Listening on port ${port}`));
});
