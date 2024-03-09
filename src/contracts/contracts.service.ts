import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../common/connections/prisma.service'
import { ContractDto } from './dto/contract.dto'
import { SearchDto } from './dto/search.dto'
import { DateTime } from 'luxon'
import { CONTRACT_STATUS } from '../constants/const'
import { UpdateContractDto } from './dto/updateContract.dto'

@Injectable()
export class ContractsService {
    constructor(private readonly config: ConfigService, private prisma: PrismaService) {}

    async createContract(data: ContractDto, userId: number): Promise<any> {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } })
            if (!user) throw new BadRequestException('User is not existed')
            if (user.amount < data.receiveAmount) throw new BadRequestException('Insufficient money')
            const updateAmount = user.amount - data.receiveAmount
            const paidAmount = data.collectMoney ? Math.round(data.loanAmount / data.numberPeriod) : undefined
            const contract = await this.prisma.contract.create({
                data: {
                    ...data,
                    userId: userId,
                    payDate: data.date,
                    status: CONTRACT_STATUS.PENDING,
                    paidAmount,
                },
            })
            await this.prisma.user.update({ where: { id: userId }, data: { amount: updateAmount } })
            const dataTransaction = []
            for (let i = 0; i < data.numberPeriod; i++) {
                let isPaid = undefined
                let dateTransfer = undefined
                let amount = 0
                if (i === 0 && data.collectMoney) {
                    isPaid = true
                    amount = Math.round(data.loanAmount / data.numberPeriod)
                    dateTransfer = data.date
                }
                const dateRow = DateTime.fromJSDate(data.date).plus({ days: i }).toJSDate()
                dataTransaction.push({
                    userId,
                    type: 'payment',
                    date: dateRow,
                    amount: amount,
                    contractId: contract.id,
                    isPaid,
                    dateTransfer,
                })
            }
            await this.prisma.transaction.createMany({ data: dataTransaction })
            return contract
        } catch (e) {
            throw e
        }
    }

    async getContract(contractId: number, userId: number): Promise<any> {
        try {
            const contract = await this.prisma.contract.findUnique({
                where: { id: contractId },
                select: {
                    id: true,
                    userId: true,
                    customerName: true,
                    customerId: true,
                    addressId: true,
                    phone: true,
                    address: true,
                    loanAmount: true,
                    receiveAmount: true,
                    paidAmount: true,
                    period: true,
                    numberPeriod: true,
                    duration: true,
                    note: true,
                    receiver: true,
                    status: true,
                    dateIdCard: true,
                    date: true,
                    payDate: true,
                    createdAt: true,
                    updatedAt: true,
                    collectMoney: true,
                    user: true,
                    transaction: true,
                    _count: true,
                },
            })
            if (!contract) throw new BadRequestException('Contract is not existed')
            const user = await this.prisma.user.findUnique({ where: { id: userId } })
            if (!user) throw new BadRequestException('User is not existed')
            if (contract.userId !== user.id && contract.userId !== user.referUserId)
                throw new ForbiddenException('You have not permission for this contract')
            return contract
        } catch (e) {
            throw e
        }
    }

    async getListContract(userId: number, queries: SearchDto): Promise<any> {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } })
            if (!user) throw new BadRequestException('User is not existed')
            const referId = user.referUserId ? user.referUserId : user.id
            let date = undefined
            if (queries.startDate)
                date = { gte: DateTime.fromFormat(queries.startDate, 'yyyy-MM-dd', { zone: 'UTC' }).toJSDate() }
            if (queries.endDate)
                date = date
                    ? {
                          ...date,
                          lte: DateTime.fromFormat(queries.endDate, 'yyyy-MM-dd', { zone: 'UTC' }).toJSDate(),
                      }
                    : { lte: DateTime.fromFormat(queries.endDate, 'yyyy-MM-dd', { zone: 'UTC' }).toJSDate() }
            const condition = {
                userId: referId,
                customerName: {
                    contains: queries.customerName ?? undefined,
                },
                date,
                status: queries.status ?? undefined,
            }
            const [data, count] = await Promise.all([
                this.prisma.contract.findMany({
                    where: condition,
                    orderBy: { date: 'desc' },
                    skip: (+queries.page - 1) * +queries.pageSize,
                    take: +queries.pageSize,
                }),
                this.prisma.contract.count({ where: condition }),
            ])
            return { data, count }
        } catch (e) {
            throw e
        }
    }

    async deleteContract(contractId: number, userId: number): Promise<any> {
        try {
            await this.prisma.contract.updateMany({
                where: { id: contractId, userId },
                data: { status: CONTRACT_STATUS.DELETED },
            })
            return true
        } catch (e) {
            throw e
        }
    }

    async updateContract(data: UpdateContractDto, userId: number, contractId: number): Promise<any> {
        try {
            const contract = await this.prisma.contract.findUnique({ where: { id: contractId } })
            if (!contract) throw new BadRequestException('Hợp đồng không tồn tại!')
            if (contract.userId !== userId) throw new ForbiddenException('Bạn không có quyền update hợp đồng này!')
            if (contract.status === CONTRACT_STATUS.CLOSED && data.status === CONTRACT_STATUS.DELETED)
                throw new BadRequestException('Hợp đồng này đã đóng, không thể xoá!')
            if (contract.status === CONTRACT_STATUS.DELETED && data.status === CONTRACT_STATUS.CLOSED)
                throw new BadRequestException('Hợp đồng này đã xoá, không thể đóng!')
            if (data.status === CONTRACT_STATUS.DELETED) {
                const recoveryAmount = contract.receiveAmount - contract.paidAmount
                return await Promise.all([
                    this.prisma.user.update({ where: { id: userId }, data: { amount: { increment: recoveryAmount } } }),
                    this.prisma.contract.update({ where: { id: contractId }, data }),
                ])
            }
            return this.prisma.contract.update({ where: { id: contractId }, data })
        } catch (e) {
            throw e
        }
    }
}
