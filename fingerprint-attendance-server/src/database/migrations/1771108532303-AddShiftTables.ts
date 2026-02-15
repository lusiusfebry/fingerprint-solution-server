import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShiftTables1771108532303 implements MigrationInterface {
  name = 'AddShiftTables1771108532303';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "employee_shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "shift_id" uuid NOT NULL, "tanggal_mulai" date NOT NULL, "tanggal_selesai" date, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eb34f4c63fe25596ca37bd6e097" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ca00b8b4c22f00f7c6f7b9c0d4" ON "employee_shifts" ("employee_id", "shift_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nama" character varying(100) NOT NULL, "jam_masuk" TIME NOT NULL, "jam_pulang" TIME NOT NULL, "toleransi_terlambat" integer NOT NULL DEFAULT '0', "hari_kerja" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_shifts" ADD CONSTRAINT "FK_6724eec1f7473e66ce69e7d0bc0" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_shifts" ADD CONSTRAINT "FK_9b4cf056bf73f4f2cc13c55cd27" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_shifts" DROP CONSTRAINT "FK_9b4cf056bf73f4f2cc13c55cd27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_shifts" DROP CONSTRAINT "FK_6724eec1f7473e66ce69e7d0bc0"`,
    );
    await queryRunner.query(`DROP TABLE "shifts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ca00b8b4c22f00f7c6f7b9c0d4"`,
    );
    await queryRunner.query(`DROP TABLE "employee_shifts"`);
  }
}
