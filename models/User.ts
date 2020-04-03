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
import { MinLength, IsEmail, IsOptional, IsString } from "class-validator";

import randomcolor from "randomcolor";
import Message from "./Message";
import Channel from "./Channel";

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @MinLength(1)
  username: string;

  @Column({ nullable: true })
  @MinLength(8)
  @IsString()
  @IsOptional()
  password: string;

  @Column({ nullable: true, unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true, unique: true })
  githubId: string;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column()
  color: string;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @OneToMany(() => Message, (message) => message.user, {
    onDelete: "CASCADE",
  })
  messages: Message[];

  @ManyToMany(() => Channel, (channel) => channel.users, {
    onDelete: "CASCADE",
  })
  @JoinTable()
  channels: Channel[];

  static async findOrCreateGithub(profile, next): Promise<void> {
    const email = profile.emails.filter((x) => x.primary)[0].value;
    let user: User = await User.findOne({
      where: [{ email }, { githubId: profile.id }],
    });

    if (user) {
      if (user.githubId === null) {
        user.githubId = profile.id;
      }
      if (user.email === null) {
        user.email = email;
      }
      if (user.username === null) {
        user.username = profile.username;
      }
      await user.save();
      next(user);
    } else {
      user = new User();
      user.color = randomcolor({ hue: "blue" });
      user.githubId = profile.id;
      user.username = profile.username;
      user.email = email;
      await user.save();
      next(user);
    }
  }

  static async findOrCreateGoogle(profile, next): Promise<void> {
    const email: string = profile.emails.filter((x) => x.verified)[0].value;
    let user: User = await User.findOne({
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
      user.username = profile.displayName;
      user.email = email;
      await user.save();
      next(user);
    }
  }
}
