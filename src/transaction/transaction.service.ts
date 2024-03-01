import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../common/connections/prisma.service'
import { TransactionDto } from '../contracts/dto/transaction.dto'
import { DateTime } from 'luxon'

@Injectable()
export class TransactionService {
    constructor(private readonly config: ConfigService, private prisma: PrismaService) {}

    async getListTrans(contractId: number, userId: number) {
        try {
            return this.prisma.transaction.findMany({ where: { contractId, userId } })
        } catch (e) {
            throw e
        }
    }

    async createTransaction(contractId: number, userId: number, data: TransactionDto) {
        try {
            const contract = await this.prisma.contract.findFirst({ where: { id: contractId, userId } })
            if (!contract) throw new BadRequestException('Contract does not exist or does not belong you')
            const transactionWithDate = await this.prisma.transaction.findFirst({
                where: { date: data.date, contractId, userId },
            })
            if (transactionWithDate) throw new BadRequestException('Date already existed')
            return this.prisma.transaction.create({
                data: {
                    userId,
                    type: 'date',
                    contractId,
                    date: data.date,
                    amount: data.amount,
                },
            })
        } catch (e) {
            throw e
        }
    }
}
