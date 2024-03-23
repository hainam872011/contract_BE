import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../common/connections/prisma.service'
import { TransactionDto } from '../contracts/dto/transaction.dto'
import { DateTime } from 'luxon'
import { CONTRACT_STATUS, TRANSACTION_TYPE } from '../constants/const'

@Injectable()
export class TransactionService {
    constructor(private readonly config: ConfigService, private prisma: PrismaService) {}

    async getListTrans(contractId: number) {
        try {
            const contract = await this.prisma.contract.findUnique({ where: { id: contractId } })
            if (!contract) throw new BadRequestException('Không tìm thấy hợ đồng')
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
            if (contract.status === CONTRACT_STATUS.CLOSED || contract.status === CONTRACT_STATUS.DELETED)
                throw new BadRequestException('Hợp đồng đã đóng hoặc xoá, không thể thao tác')
            let calculateAmount = { increment: data.amount }
            let amount = data.amount
            if (!data.isPaid) {
                calculateAmount = { increment: 0 - data.amount }
                amount = 0
            }
            const [createTrans, updateAmount] = await Promise.all([
                this.prisma.transaction.update({
                    where: { id: transactionId },
                    data: {
                        isPaid: data.isPaid,
                        dateTransfer: data.dateTransfer,
                        amount,
                    },
                }),
                this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        amount: calculateAmount,
                    },
                }),
            ])
            // Update paydate and amount to contract
            const lastTransPaid = await this.prisma.transaction.findFirst({
                where: {
                    contractId,
                    type: TRANSACTION_TYPE.PAYMENT,
                    isPaid: true,
                },
                orderBy: { date: 'desc' },
            })
            if (lastTransPaid?.id) {
                await this.prisma.contract.update({
                    where: { id: contractId },
                    data: { payDate: lastTransPaid.date, paidAmount: calculateAmount },
                })
            }
            return createTrans
        } catch (e) {
            throw e
        }
    }
}
