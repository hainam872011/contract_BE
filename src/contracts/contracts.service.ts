import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../common/connections/prisma.service'
import { ContractDto } from './dto/contract.dto'
import { SearchDto } from './dto/search.dto'
import { DateTime } from 'luxon'
import { CONTRACT_STATUS, TRANSACTION_TYPE } from '../constants/const'
import { UpdateContractDto } from './dto/updateContract.dto'
import { PayFastDto } from './dto/payFast.dto'

@Injectable()
export class ContractsService {
    constructor(private readonly config: ConfigService, private prisma: PrismaService) {}

    async createContract(data: ContractDto, userId: number): Promise<any> {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } })
            if (!user) throw new BadRequestException('Tài khoản không tồn tại')
            if (user.amount < data.receiveAmount) throw new BadRequestException('Không đủ tiền cho vay mới')
            let updateAmount = user.amount - data.receiveAmount
            const paidAmount = data.collectMoney ? Math.round(data.loanAmount / data.numberPeriod) : undefined
            updateAmount = paidAmount ? updateAmount + paidAmount : updateAmount
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

    async changeContract(contractId: number, userId: number, data: ContractDto): Promise<any> {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } })
            if (!user) throw new BadRequestException('Tài khoản không tồn tại')
            const contract = await this.prisma.contract.findUnique({ where: { id: contractId } })
            if (!contract) throw new BadRequestException('Hợp đồng không tồn tại')
            const amountPerDay = Number(contract.loanAmount) / Number(contract.numberPeriod)
            const updateAmount = Number(contract.loanAmount) - Number(contract.paidAmount) - Number(data.receiveAmount)
            if (Number(user.amount) + updateAmount < 0) throw new BadRequestException('Không đủ tiền cho vay mới')
            const [trans, oldContract, newContract, updateUser] = await Promise.all([
                // Update transaction
                this.prisma.transaction.updateMany({
                    where: { userId, contractId, isPaid: false },
                    data: { amount: amountPerDay, isPaid: true, dateTransfer: new Date() },
                }),
                // Close contract, update amount, day paid to contract
                this.prisma.contract.update({
                    where: { id: contractId },
                    data: { status: CONTRACT_STATUS.CLOSED, paidAmount: contract.loanAmount, payDate: new Date() },
                }),
                // Create new contract
                this.prisma.contract.create({
                    data: {
                        ...contract,
                        userId: userId,
                        payDate: data.date,
                        status: CONTRACT_STATUS.PENDING,
                        paidAmount: 0,
                    },
                }),
                // Update user Amount
                this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        amount: { increment: updateAmount },
                    },
                }),
            ])
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
            return newContract
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
            if (!contract) throw new BadRequestException('Hợp đồng không tồn tại')
            const user = await this.prisma.user.findUnique({ where: { id: userId } })
            if (!user) throw new BadRequestException('Tài khoản không tồn tại')
            if (contract.userId !== user.id && contract.userId !== user.referUserId)
                throw new ForbiddenException('Bạn không có quyền xem hợp đồng này')
            return contract
        } catch (e) {
            throw e
        }
    }

    async getListContract(userId: number, queries: SearchDto): Promise<any> {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } })
            if (!user) throw new BadRequestException('Tài khoản không tồn tại')
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
            if (queries.status === 'delay') {
                delete condition.status
                condition['OR'] = [
                    { status: CONTRACT_STATUS.ON_TIME },
                    { status: CONTRACT_STATUS.LATE },
                    { status: CONTRACT_STATUS.EXPIRED },
                    { status: CONTRACT_STATUS.LAST_DAY },
                ]
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
            const result = data.map((e) => {
                const payDateTime = DateTime.fromJSDate(e.payDate).endOf('day')
                const now = DateTime.now()
                // const numberDayDelay = Math.ceil(now.diff(payDateTime, 'days').days)
                // const amountDelay = (e.loanAmount / e.numberPeriod) * numberDayDelay
                const numberDayDelay = Math.ceil(now.diff(payDateTime, 'days').days)
                const amountDelay = (e.loanAmount / e.numberPeriod) * numberDayDelay
                const textNotice = `Chậm ${numberDayDelay} ngày đóng họ. Đóng ${amountDelay.toLocaleString(
                    'en-US',
                )} tiền họ.`
                const ratio = `${((e.loanAmount * 10) / e.receiveAmount).toFixed(0)} ăn 10`
                const amountPerDay = e.loanAmount / e.numberPeriod
                const unpaidAmount = e.loanAmount - e.paidAmount
                const dateToPay = e.loanAmount - e.paidAmount
                return {
                    ...e,
                    numberDayDelay,
                    amountDelay,
                    textNotice,
                    ratio,
                    amountPerDay,
                    unpaidAmount,
                }
            })
            return { result, count }
        } catch (e) {
            throw e
        }
    }

    async deleteContract(contractId: number, userId: number): Promise<any> {
        try {
            const contract = await this.prisma.contract.findUnique({ where: { id: contractId } })
            if (!contract) throw new BadRequestException('Hợp đồng không tồn tại!')
            if (contract.userId !== userId) throw new ForbiddenException('Bạn không có quyền update hợp đồng này!')
            if (contract.status === CONTRACT_STATUS.CLOSED)
                throw new BadRequestException('Hợp đồng này đã đóng, không thể xoá!')
            const recoveryAmount = contract.receiveAmount - contract.paidAmount
            await Promise.all([
                this.prisma.user.update({ where: { id: userId }, data: { amount: { increment: recoveryAmount } } }),
                this.prisma.contract.update({ where: { id: contractId }, data: { status: CONTRACT_STATUS.DELETED } }),
            ])
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

    async payFast(contractId: number, userId: number, data: PayFastDto): Promise<any> {
        try {
            const contract = await this.prisma.contract.findUnique({ where: { id: contractId } })
            if (!contract) throw new NotFoundException('Không tìm thấy hợp đồng')
            if (contract.userId !== userId) throw new BadRequestException('Bạn không có quyền sửa HĐ này')
            if (contract.status === CONTRACT_STATUS.DELETED || contract.status === CONTRACT_STATUS.CLOSED)
                throw new BadRequestException('Hợp đồng đã đóng hoặc bị xoá')
            if (contract.paidAmount >= contract.loanAmount) throw new BadRequestException('Hợp đồng đã được trả đủ')
            const amountPerDay = contract.loanAmount / contract.numberPeriod
            const numberDayOfPay = Number(data.amount) / Number(amountPerDay)
            for (let i = 1; i < numberDayOfPay; i++) {
                const lastTransNotPaid = await this.prisma.transaction.findFirst({
                    where: {
                        contractId,
                        type: TRANSACTION_TYPE.PAYMENT,
                        isPaid: false,
                    },
                    orderBy: { date: 'asc' },
                })
                if (lastTransNotPaid?.id) {
                    await this.prisma.transaction.update({
                        where: { id: lastTransNotPaid.id },
                        data: { amount: amountPerDay, dateTransfer: new Date(), isPaid: true },
                    })
                }
            }
            // Update payDate and paid amount to contract
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
                    data: { payDate: lastTransPaid.date, paidAmount: { increment: data.amount } },
                })
            }
            // Update amount to user
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    amount: { increment: data.amount },
                },
            })
        } catch (e) {
            throw e
        }
    }
}
