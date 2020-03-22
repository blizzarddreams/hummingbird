import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  CreateDateColumn,
  OneToMany,
} from "typeorm";

import User from "./User";
import Message from "./Message";

@Entity()
export default class Channel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(
    () => User,
    (user) => user.channels,
    {
      onDelete: "CASCADE",
    },
  )
  users: User[];

  @OneToMany(
    () => Message,
    (message) => message.channel,
    {
      onDelete: "CASCADE",
    },
  )
  messages: Message[];

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  static async findOrCreate(name: string): Promise<Channel> {
    let channel = await Channel.findOne({ name });
    if (!channel) {
      channel = new Channel();
      channel.name = name;
      await channel.save();
      return channel;
    }
    return channel;
  }
}
