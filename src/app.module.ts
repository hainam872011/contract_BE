import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HealthModule } from './health/health.module'
import { PrismaModule } from './common/connections/prisma.module'
import configuration from '../config/configuration'
import { AuthModule } from './common/auth/auth.module'
import { UsersModule } from './users/users.module'
import { ContractsModule } from './contracts/contracts.module'
import { TransactionModule } from './transaction/transaction.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `${process.cwd()}/config/env/${process.env.ENV || 'local'}.env`,
            expandVariables: true,
            load: [configuration],
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        PrismaModule,
        HealthModule,
        AuthModule,
        UsersModule,
        ContractsModule,
        TransactionModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
