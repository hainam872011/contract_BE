import { Module } from '@nestjs/common'
import { ContractsService } from './contracts.service'
import { ContractsController } from './contracts.controller'
import { UpdateStatusCron } from './updateStatus.cron'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from '../common/connections/prisma.module'

@Module({
    imports: [ConfigModule, ScheduleModule.forRoot(), PrismaModule],
    controllers: [ContractsController],
    providers: [ContractsService, UpdateStatusCron],
})
export class ContractsModule {}
