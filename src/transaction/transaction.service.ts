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
            const trans = await this.prisma.transaction.findMany({ where: { contractId } })
            const expectedAmount = Math.round(contract.loanAmount / contract.numberPeriod)
            return trans.map((i) => ({ ...i, expectedAmount }))
        } catch (e) {
            throw e
        }
    }

    async updateTransaction(contractId: number, transactionId: number, userId: number, data: TransactionDto) {
        try {
            const contract = await this.prisma.contract.findFirst({ where: { id: contractId, userId } })
            if (!contract) throw new BadRequestException('Contract does not exist or does not belong you')
            let calculateAmount = { increment: data.amount }
            let amount = data.amount
            let payDate = DateTime.fromJSDate(data.dateTransfer).plus({ day: contract.duration }).toJSDate()
            if (!data.isPaid) {
                calculateAmount = { increment: 0 - data.amount }
                amount = 0
                payDate = data.dateTransfer
            }
            const [createTrans, updateContract, updateAmount] = await Promise.all([
                this.prisma.transaction.update({
                    where: { id: transactionId },
                    data: {
                        isPaid: data.isPaid,
                        dateTransfer: data.dateTransfer,
                        amount,
                    },
                }),
                this.prisma.contract.update({
                    where: { id: contractId },
                    data: {
                        paidAmount: calculateAmount,
                        payDate,
                    },
                }),
                this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        amount: calculateAmount,
                    },
                }),
            ])
            return createTrans
        } catch (e) {
            throw e
        }
    }
}
