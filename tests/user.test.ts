import { createConnection, QueryFailedError } from "typeorm";
import { validate } from "class-validator";
import { User, Channel, Message } from "../models";

require("dotenv").config({ path: ".env.testing" });

describe("users", () => {
  let connection;
  const profileData = {
    id: 1,
    username: "githubTest1",
    emails: [
      { value: "test1@test.com", primary: true },
      { value: "test2@test.com", primary: false },
    ],
  };

  beforeAll(async () => {
    connection = await createConnection();
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    let user = new User();
    user.username = "test";
    user.color = "test";
    user.email = "test@test.com";
    await user.save();
  });

  afterEach(async () => {
    await User.delete({});
    await Channel.delete({});
    await Message.delete({});
  });

  test("should prevent user from saving because same username", async () => {
    let user = new User();
    user.username = "test";
    user.color = "test";
    user.email = "test2@test.com";
    await expect(user.save()).rejects.toThrowError(QueryFailedError);
  });

  test("should prevent user from saving because password invalid", async () => {
    let user = new User();
    user.username = "test2";
    user.color = "test";
    user.email = "test2@test.com";
    user.password = "abcdefg";
    await expect(validate(user)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraints: {
            minLength: "password must be longer than or equal to 8 characters",
          },
        }),
      ]),
    );
  });

  test("should allow creation of a new user github oauth account", () => {
    User.findOrCreateGithub(profileData, (user) => {
      expect(user).toHaveProperty("githubId", 1);
      expect(user).toHaveProperty("username", "githubTest1");
    });
  });

  test("should save github oauth id to a previous user acccount", async () => {
    let newUser = new User();
    newUser.username = "githubTest2";
    newUser.color = "test";
    newUser.email = "test1@test.com";
    await newUser.save();
    User.findOrCreateGithub(profileData, (user) => {
      expect(user).toHaveProperty("githubId", 1);
      expect(user).toHaveProperty("username", "githubTest2");
    });
  });

  test("should save user to the channel", async () => {
    let channel = new Channel();
    let user = await User.findOne({
      where: { username: "test" },
      relations: ["channels"],
    });
    channel.name = "test";
    await channel.save();
    user.channels.push(channel);
    await user.save();
    channel = await Channel.findOne({
      where: { name: "test" },
      relations: ["users"],
    });
    delete user.channels;
    expect(channel.users).toContainEqual(user);
  });

  test("should prevent user from saving because email is invalid", async () => {
    let user = new User();
    user.username = "test2";
    user.color = "test";
    user.email = "test";
    await expect(validate(user)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraints: {
            isEmail: "email must be an email",
          },
        }),
      ]),
    );
  });
});
