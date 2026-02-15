# Fingerprint Attendance Server

## Project Overview
A robust NestJS-based backend server for managing fingerprint attendance, employee data, device synchronization, and shift management.

## Tech Stack
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Validation**: class-validator
- **Documentation**: Swagger (OpenAPI)
- **Authentication**: JWT (Planned)

## Modular Architecture
The project follows a modular structure to separate concerns:

### 1. Core Modules
- **AppModule**: Main entry point, configures ConfigModule, TypeORM, and global settings.
- **ConfigModule**: Manages environment variables.

### 2. Feature Modules
- **EmployeesModule**: Manages employee data, profile pictures, and fingerprint template uploads.
- **DevicesModule**: Handles communication with fingerprint devices (ZKTeco/Solution) via TCP/IP sockets. Includes scanning, monitoring, and command execution.
- **FingerprintTemplatesModule**: Stores and retrieves fingerprint templates.
- **AttendanceLogsModule**: Manages attendance logs, calculation logic, and reporting.
- **ShiftsModule**: Handles shift definitions and employee-shift assignments.
- **SyncHistoryModule**: Tracks synchronization events between server and devices.

### 3. Key Services & Logic
- **Attendance Calculation**: Complex logic to determine attendance status (Present, Late, Alpha) based on shifts, including overnight shift handling.
- **Device Synchronization**: Real-time and scheduled synchronization of logs and user data with devices.
- **Excel Import**: Bulk import capabilities for employees.

## Setup & Running
1. **Install Dependencies**: `npm install`
2. **Database Setup**: Ensure PostgreSQL is running and `.env` is configured.
3. **Migrations**: `npm run migration:run`
4. **Seeds**: `npm run seed`
5. **Run Development**: `npm run start:dev`
6. **Build**: `npm run build`

## Development Guidelines
- **Linting**: Run `npm run lint` before committing.
- **Type Checking**: Run `npx tsc --noemit` to verify types.
- **Formatting**: Use Prettier (enforced by ESLint).