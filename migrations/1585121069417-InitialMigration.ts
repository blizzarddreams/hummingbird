import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1585121069417 implements MigrationInterface {
    name = 'InitialMigration1585121069417'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "data" character varying NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "userId" integer, "channelId" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying, "email" character varying, "githubId" character varying, "googleId" character varying, "color" character varying NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_0d84cc6a830f0e4ebbfcd6381dd" UNIQUE ("githubId"), CONSTRAINT "UQ_470355432cc67b2c470c30bef7c" UNIQUE ("googleId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "channel" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_800e6da7e4c30fbb0653ba7bb6c" UNIQUE ("name"), CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "user_channels_channel" ("userId" integer NOT NULL, "channelId" integer NOT NULL, CONSTRAINT "PK_01cb58c2f493472e335712d76c7" PRIMARY KEY ("userId", "channelId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_9c701cabd952769d5c75844343" ON "user_channels_channel" ("userId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_ab9fe5d9528e30e09b462c345d" ON "user_channels_channel" ("channelId") `, undefined);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_446251f8ceb2132af01b68eb593" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_5fdbbcb32afcea663c2bea2954f" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "user_channels_channel" ADD CONSTRAINT "FK_9c701cabd952769d5c75844343c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "user_channels_channel" ADD CONSTRAINT "FK_ab9fe5d9528e30e09b462c345d2" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user_channels_channel" DROP CONSTRAINT "FK_ab9fe5d9528e30e09b462c345d2"`, undefined);
        await queryRunner.query(`ALTER TABLE "user_channels_channel" DROP CONSTRAINT "FK_9c701cabd952769d5c75844343c"`, undefined);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_5fdbbcb32afcea663c2bea2954f"`, undefined);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_446251f8ceb2132af01b68eb593"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_ab9fe5d9528e30e09b462c345d"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_9c701cabd952769d5c75844343"`, undefined);
        await queryRunner.query(`DROP TABLE "user_channels_channel"`, undefined);
        await queryRunner.query(`DROP TABLE "channel"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`DROP TABLE "message"`, undefined);
    }

}
