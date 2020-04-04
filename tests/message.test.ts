import { createConnection, Connection } from "typeorm";
import { validate } from "class-validator";
import { User, Channel, Message } from "../models";

require("dotenv").config({ path: ".env.testing" });

describe("messages", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    const user = new User();
    user.username = "test";
    user.color = "test";
    user.email = "test@test.com";
    await user.save();
  });

  afterEach(async () => {
    await Message.delete({});
    await User.delete({});
    await Channel.delete({});
  });

  test("should not save message because data is not valid", async () => {
    const user: User = await User.findOneOrFail({ username: "test" });
    const message = new Message();
    message.data = "";
    message.user = user;
    await expect(validate(message)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraints: {
            minLength: "data must be longer than or equal to 1 characters",
            isNotEmpty: "data should not be empty",
          },
        }),
      ]),
    );
  });
});
