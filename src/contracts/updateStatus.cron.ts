import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../common/connections/prisma.service'
import { CONTRACT_STATUS } from '../constants/const'
import { DateTime, Duration } from 'luxon'

@Injectable()
export class UpdateStatusCron {
    constructor(private readonly config: ConfigService, private prisma: PrismaService) {}

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    // @Cron(CronExpression.EVERY_MINUTE)
    async updateStatus(): Promise<void> {
        try {
            console.log(`START RUN CRON`)
            const contracts = await this.prisma.contract.findMany({
                where: {
                    status: {
                        in: [
                            CONTRACT_STATUS.LATE,
                            CONTRACT_STATUS.PENDING,
                            CONTRACT_STATUS.ON_TIME,
                            CONTRACT_STATUS.LAST_DAY,
                        ],
                    },
                },
            })
            if (!contracts || !Array.isArray(contracts) || contracts.length === 0) return
            for (const contract of contracts) {
                const startDate = DateTime.fromJSDate(contract.date)
                const duration = contract.numberPeriod
                const now = DateTime.local()
                const endDate = startDate.plus({ day: duration })
                const status = contract.status
                const lastPayDate = DateTime.fromJSDate(contract.payDate)
                const diffPayDate = now.diff(lastPayDate, 'days').days
                const diffLastDay = now.diff(endDate, 'days').days
                // Change status to expired
                if (diffLastDay >= 1) {
                    await this.updateContractStatus(contract.id, CONTRACT_STATUS.EXPIRED)
                }
                if (diffPayDate < 1) {
                    await this.updateContractStatus(contract.id, CONTRACT_STATUS.PENDING)
                }
                // Pending || Late -> on time
                if ((status === CONTRACT_STATUS.PENDING || status === CONTRACT_STATUS.LATE) && diffPayDate < 2 && diffPayDate > 1) {
                    await this.updateContractStatus(contract.id, CONTRACT_STATUS.ON_TIME)
                }
                // Pending -> late
                if ((status === CONTRACT_STATUS.PENDING || status === CONTRACT_STATUS.ON_TIME) && diffPayDate > 2) {
                    await this.updateContractStatus(contract.id, CONTRACT_STATUS.LATE)
                }
                // Pending -> last day
                if (status === CONTRACT_STATUS.PENDING && diffLastDay === 0) {
                    await this.updateContractStatus(contract.id, CONTRACT_STATUS.LAST_DAY)
                }
            }
            console.log(`RUN CRON END`)
        } catch (e) {
            console.log(`[updateStatus ERROR] e: ${e}`)
        }
    }

    private async updateContractStatus(contractId: number, status: string) {
        await this.prisma.contract.update({
            where: { id: contractId },
            data: { status: status },
        })
    }
}
