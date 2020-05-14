import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { MinLength, IsNotEmpty } from "class-validator";
import { IsNotEmptyString } from "../validators";

import User from "./User";
import Channel from "./Channel";

@Entity()
export default class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @MinLength(1)
  //@IsNotEmpty()
  @IsNotEmptyString()
  data!: string;

  @CreateDateColumn({ nullable: true })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: "CASCADE",
  })
  user!: User;

  @ManyToOne(() => Channel, (channel) => channel.messages, {
    onDelete: "CASCADE",
  })
  channel!: Channel;
}
