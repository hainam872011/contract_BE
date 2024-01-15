import { Module } from '@nestjs/common'
import { ContractsService } from './contracts.service'
import { ContractsController } from './contracts.controller'

@Module({})
export class ContractsModule {
    controllers: [ContractsController]
    providers: [ContractsService]
}
