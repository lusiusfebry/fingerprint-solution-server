import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFullToSyncTypeEnum1771089217310 implements MigrationInterface {
  name = 'AddFullToSyncTypeEnum1771089217310';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."devices_status_enum" RENAME TO "devices_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."devices_status_enum" AS ENUM('online', 'offline', 'syncing', 'error')`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "status" TYPE "public"."devices_status_enum" USING "status"::"text"::"public"."devices_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "status" SET DEFAULT 'offline'`,
    );
    await queryRunner.query(`DROP TYPE "public"."devices_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sync_history_sync_type_enum" RENAME TO "sync_history_sync_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sync_history_sync_type_enum" AS ENUM('pull_logs', 'push_employees', 'push_templates', 'sync_time', 'full')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sync_history" ALTER COLUMN "sync_type" TYPE "public"."sync_history_sync_type_enum" USING "sync_type"::"text"::"public"."sync_history_sync_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."sync_history_sync_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fingerprint_templates" ADD CONSTRAINT "UQ_08069992080778d518339846c81" UNIQUE ("employee_id", "finger_index")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fingerprint_templates" DROP CONSTRAINT "UQ_08069992080778d518339846c81"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sync_history_sync_type_enum_old" AS ENUM('pull_logs', 'push_employees', 'push_templates', 'sync_time')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sync_history" ALTER COLUMN "sync_type" TYPE "public"."sync_history_sync_type_enum_old" USING "sync_type"::"text"::"public"."sync_history_sync_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sync_history_sync_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sync_history_sync_type_enum_old" RENAME TO "sync_history_sync_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."devices_status_enum_old" AS ENUM('online', 'offline', 'syncing')`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "status" TYPE "public"."devices_status_enum_old" USING "status"::"text"::"public"."devices_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "devices" ALTER COLUMN "status" SET DEFAULT 'offline'`,
    );
    await queryRunner.query(`DROP TYPE "public"."devices_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."devices_status_enum_old" RENAME TO "devices_status_enum"`,
    );
  }
}
