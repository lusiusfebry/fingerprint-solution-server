import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Employee } from '../src/database/entities/employee.entity';
import { Device } from '../src/database/entities/device.entity';

async function seedLoadTest() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const employeeRepo = dataSource.getRepository(Employee);
    const deviceRepo = dataSource.getRepository(Device);

    console.log('Clearing old load test data...');
    // Optional: clear existing test data if needed. 
    // Be careful if running on a real DB. 

    console.log('Seeding 10 Devices...');
    for (let i = 1; i <= 10; i++) {
        const existing = await deviceRepo.findOne({ where: { serial_number: `LOAD-SN-${i}` } });
        if (!existing) {
            await deviceRepo.save(deviceRepo.create({
                name: `Load Test Device ${i}`,
                serial_number: `LOAD-SN-${i}`,
                ip_address: `127.0.0.${i}`,
                port: 4370,
                status: 'online'
            }));
        }
    }

    console.log('Seeding 1000 Employees...');
    const employees: Employee[] = [];
    for (let i = 1; i <= 1000; i++) {
        const nik = `LOAD-NIK-${i.toString().padStart(4, '0')}`;
        const existing = await employeeRepo.findOne({ where: { nik } });
        if (!existing) {
            employees.push(employeeRepo.create({
                nik,
                nama: `Load Test Employee ${i}`,
                departemen: 'Testing',
                jabatan: 'QA',
                status: 'aktif'
            }));
        }

        if (employees.length >= 100) {
            await employeeRepo.save(employees);
            employees.length = 0;
            console.log(`Saved ${i} employees...`);
        }
    }
    if (employees.length > 0) {
        await employeeRepo.save(employees);
    }

    console.log('Seeding completed successfully.');
    await app.close();
}

seedLoadTest().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
