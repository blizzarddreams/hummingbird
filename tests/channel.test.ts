import { createConnection, QueryFailedError, Connection } from "typeorm";
import { User, Channel, Message } from "../models";

require("dotenv").config({ path: ".env.testing" });

describe("channels", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    const channel: Channel = new Channel();
    channel.name = "test";
    await channel.save();
  });

  afterEach(async () => {
    await Message.delete({});
    await User.delete({});
    await Channel.delete({});
  });

  test("should not allow duplicate channel", async () => {
    const channel: Channel = new Channel();
    channel.name = "test";
    await expect(channel.save()).rejects.toThrowError(QueryFailedError);
  });
});
