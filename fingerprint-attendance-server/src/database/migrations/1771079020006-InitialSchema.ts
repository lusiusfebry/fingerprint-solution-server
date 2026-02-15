import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1771079020006 implements MigrationInterface {
  name = 'InitialSchema1771079020006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "description" text, "permissions" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(100) NOT NULL, "email" character varying(200) NOT NULL, "password" character varying(255) NOT NULL, "full_name" character varying(200) NOT NULL, "role_id" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "last_login" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."devices_status_enum" AS ENUM('online', 'offline', 'syncing')`,
    );
    await queryRunner.query(
      `CREATE TABLE "devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "serial_number" character varying(100) NOT NULL, "ip_address" character varying(15) NOT NULL, "port" integer NOT NULL DEFAULT '80', "location" character varying(200), "status" "public"."devices_status_enum" NOT NULL DEFAULT 'offline', "last_sync_time" TIMESTAMP, "comm_key" character varying(50) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cc9e89897e336172fd06367735d" UNIQUE ("serial_number"), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sync_history_sync_type_enum" AS ENUM('pull_logs', 'push_employees', 'push_templates', 'sync_time')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sync_history_status_enum" AS ENUM('success', 'failed', 'partial')`,
    );
    await queryRunner.query(
      `CREATE TABLE "sync_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "device_id" uuid NOT NULL, "sync_type" "public"."sync_history_sync_type_enum" NOT NULL, "status" "public"."sync_history_status_enum" NOT NULL, "records_count" integer NOT NULL DEFAULT '0', "error_message" text, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e929aeba0c2244394dab3a7514c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employees_status_enum" AS ENUM('aktif', 'nonaktif')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nik" character varying(50) NOT NULL, "nama" character varying(200) NOT NULL, "departemen" character varying(100), "jabatan" character varying(100), "status" "public"."employees_status_enum" NOT NULL DEFAULT 'aktif', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_489786f7733ad24dbb649035d77" UNIQUE ("nik"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "fingerprint_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "finger_index" integer NOT NULL, "template_data" text NOT NULL, "version" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4fc586f02e776951aaedbb1565b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "attendance_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "device_id" uuid NOT NULL, "timestamp" TIMESTAMP NOT NULL, "verify_type" integer NOT NULL, "in_out_mode" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e78c28cf950bd06d614ae09f26b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8d4abc2f192290351e38ab5466" ON "attendance_logs" ("device_id", "timestamp") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aca25a6ce12ee50956cfaa4460" ON "attendance_logs" ("employee_id", "timestamp") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sync_history" ADD CONSTRAINT "FK_e277a2a66240ae3d3d0fdd07a7d" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fingerprint_templates" ADD CONSTRAINT "FK_2a948768e2698d259308ce2bb01" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance_logs" ADD CONSTRAINT "FK_c4ca4ff3d403535898ba7ae6ba3" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance_logs" ADD CONSTRAINT "FK_058526643ec7189b132892280c8" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "attendance_logs" DROP CONSTRAINT "FK_058526643ec7189b132892280c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance_logs" DROP CONSTRAINT "FK_c4ca4ff3d403535898ba7ae6ba3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fingerprint_templates" DROP CONSTRAINT "FK_2a948768e2698d259308ce2bb01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sync_history" DROP CONSTRAINT "FK_e277a2a66240ae3d3d0fdd07a7d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aca25a6ce12ee50956cfaa4460"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8d4abc2f192290351e38ab5466"`,
    );
    await queryRunner.query(`DROP TABLE "attendance_logs"`);
    await queryRunner.query(`DROP TABLE "fingerprint_templates"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TYPE "public"."employees_status_enum"`);
    await queryRunner.query(`DROP TABLE "sync_history"`);
    await queryRunner.query(`DROP TYPE "public"."sync_history_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."sync_history_sync_type_enum"`);
    await queryRunner.query(`DROP TABLE "devices"`);
    await queryRunner.query(`DROP TYPE "public"."devices_status_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
