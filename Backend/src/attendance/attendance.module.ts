import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance } from './entities/attendance.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, AttendanceRecord])],
  providers: [AttendanceService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
