import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1771112500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Indexes for Employees
    await queryRunner.query(
      `CREATE INDEX "IDX_EMPLOYEES_STATUS" ON "employees" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_EMPLOYEES_NIK" ON "employees" ("nik")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_EMPLOYEES_AKTIF" ON "employees" ("id") WHERE "status" = 'aktif'`,
    );

    // Indexes for Devices
    await queryRunner.query(
      `CREATE INDEX "IDX_DEVICES_STATUS" ON "devices" ("status")`,
    );

    // Indexes for Sync History
    await queryRunner.query(
      `CREATE INDEX "IDX_SYNC_HISTORY_DEVICE_TIMESTAMP" ON "sync_history" ("device_id", "timestamp")`,
    );

    // Indexes for Fingerprint Templates
    await queryRunner.query(
      `CREATE INDEX "IDX_TEMPLATES_EMPLOYEE" ON "fingerprint_templates" ("employee_id")`,
    );

    // Indexes for Users
    await queryRunner.query(
      `CREATE INDEX "IDX_USERS_USERNAME" ON "users" ("username")`,
    );

    // Additional Index for Attendance Logs (if not already sufficient)
    await queryRunner.query(
      `CREATE INDEX "IDX_ATTENDANCE_TIMESTAMP" ON "attendance_logs" ("timestamp")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ATTENDANCE_TIMESTAMP"`);
    await queryRunner.query(`DROP INDEX "IDX_USERS_USERNAME"`);
    await queryRunner.query(`DROP INDEX "IDX_TEMPLATES_EMPLOYEE"`);
    await queryRunner.query(`DROP INDEX "IDX_SYNC_HISTORY_DEVICE_TIMESTAMP"`);
    await queryRunner.query(`DROP INDEX "IDX_DEVICES_STATUS"`);
    await queryRunner.query(`DROP INDEX "IDX_EMPLOYEES_AKTIF"`);
    await queryRunner.query(`DROP INDEX "IDX_EMPLOYEES_NIK"`);
    await queryRunner.query(`DROP INDEX "IDX_EMPLOYEES_STATUS"`);
  }
}
