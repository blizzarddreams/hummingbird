import {
  createConnection,
  AfterUpdate,
  useContainer,
  QueryFailedError,
} from "typeorm";
import { validate } from "class-validator";
import { User, Channel, Message } from "../models";

require("dotenv").config({ path: ".env.testing" });

describe("channels", () => {
  let connection;
  const profileData = {
    id: 1,
    username: "githubTest",
    emails: [
      { value: "test2@test.com", primary: false },
      { value: "test4@test.com", primary: true },
    ],
  };

  beforeAll(async () => {
    connection = await createConnection();
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    let channel = new Channel();
    channel.name = "test";
    await channel.save();
  });

  afterEach(async () => {
    await Message.delete({});
    await User.delete({});
    await Channel.delete({});
  });

  test("should not allow duplicate channel", async () => {
    let newChannel = new Channel();
    newChannel.name = "test";
    await expect(newChannel.save()).rejects.toThrowError(QueryFailedError);
  });
});
