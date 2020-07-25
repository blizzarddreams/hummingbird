import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from "typeorm";

import passportGoogle from "passport-google-oauth20";
import passportGithub from "passport-github2";

import { MinLength, IsEmail, IsOptional, IsString } from "class-validator";
import { IsNotEmptyString } from "../validators";

import randomcolor from "randomcolor";
import Message from "./Message";
import Channel from "./Channel";

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

interface GoogleProfile extends passportGoogle.Profile {
  emails?: { value: string; type?: string | undefined }[] | undefined;
  id: string;
  username?: string;
  displayName: string;
}
@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @MinLength(1)
  @IsNotEmptyString()
  username!: string;

  @Column({ nullable: true })
  @MinLength(8)
  @IsString()
  @IsOptional()
  //@IsNotEmptyString()
  password!: string;

  @Column({ nullable: true, unique: true })
  @IsEmail()
  email!: string;

  @Column({ nullable: true, unique: true })
  githubId!: string;

  @Column({ nullable: true, unique: true })
  googleId!: string;

  @Column()
  color!: string;

  @Column({ nullable: true })
  status!: string;

  @Column({ default: "online" })
  mode!: string;

  @CreateDateColumn({ nullable: true })
  createdAt!: Date;

  @OneToMany(() => Message, (message) => message.user, {
    onDelete: "CASCADE",
  })
  messages!: Message[];

  @ManyToMany(() => Channel, (channel) => channel.users, {
    onDelete: "CASCADE",
  })
  @JoinTable()
  channels!: Channel[];

  static async findOrCreateGithub(
    profile: GithubProfile,
    next: (user: User) => void,
  ): Promise<void> {
    const email = profile.emails[0].value;
    let user: User | undefined = await User.findOne({
      where: [{ email }, { githubId: profile.id }],
    });

    if (user) {
      if (user.githubId === null) {
        user.githubId = profile.id;
      }
      if (user.email === null) {
        user.email = email;
      }
      if (user.username === null && profile.username !== undefined) {
        user.username = profile.username;
      }
      await user.save();
      next(user);
    } else {
      user = new User();
      user.color = randomcolor({ hue: "blue" });
      user.githubId = profile.id;
      user.username = profile.username ?? "";
      user.email = email;
      await user.save();
      next(user);
    }
  }

  static async findOrCreateGoogle(
    profile: GoogleProfile,
    next: (user: User) => void,
  ): Promise<void> {
    const email: string =
      profile.emails?.filter((email) => email)[0].value ?? "";
    let user: User | undefined = await User.findOne({
      where: [{ email }, { googleId: profile.id }],
    });

    if (user) {
      if (user.googleId === null) {
        user.googleId = profile.id;
      }
      if (user.email === null) {
        user.email = email;
      }
      await user.save();
      next(user);
    } else {
      user = new User();
      user.color = randomcolor({ hue: "blue" });
      user.githubId = profile.id;
      user.username = profile.displayName ?? "";
      user.email = email;
      await user.save();
      next(user);
    }
  }
}
