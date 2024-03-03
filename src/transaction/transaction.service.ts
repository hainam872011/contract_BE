import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../common/connections/prisma.service'
import { TransactionDto } from '../contracts/dto/transaction.dto'
import { DateTime } from 'luxon'

@Injectable()
export class TransactionService {
    constructor(private readonly config: ConfigService, private prisma: PrismaService) {}

    async getListTrans(contractId: number) {
        try {
            const contract = await this.prisma.contract.findUnique({ where: { id: contractId } })
            if (!contract) throw new BadRequestException('Contract not found')
            return this.prisma.transaction.findMany({ where: { contractId } })
        } catch (e) {
            throw e
        }
    }

    async updateTransaction(contractId: number, transactionId: number, userId: number, data: TransactionDto) {
        try {
            const contract = await this.prisma.contract.findFirst({ where: { id: contractId, userId } })
            if (!contract) throw new BadRequestException('Contract does not exist or does not belong you')
            const [createTrans, updateContract, updateAmount] = await Promise.all([
                this.prisma.transaction.update({
                    where: { id: transactionId },
                    data: {
                        isPaid: data.isPaid,
                        dateTransfer: data.dateTransfer,
                        amount: data.amount,
                    },
                }),
                this.prisma.contract.update({
                    where: { id: contractId },
                    data: {
                        paidAmount: { increment: data.amount },
                    },
                }),
                this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        amount: { increment: data.amount },
                    },
                }),
            ])
            return createTrans
        } catch (e) {
            throw e
        }
    }
}
