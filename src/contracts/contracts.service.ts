import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../common/connections/prisma.service'
import { ContractDto } from './dto/contract.dto'
import { SearchDto } from './dto/search.dto'
import { Prisma } from '@prisma/client'
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
            const [contract, amount] = await Promise.all([
                this.prisma.contract.create({
                    data: {
                        ...data,
                        userId: userId,
                        payDate: data.date,
                        status: CONTRACT_STATUS.PENDING,
                    },
                }),
                this.prisma.user.update({ where: { id: userId }, data: { amount: updateAmount } }),
            ])
            return contract
        } catch (e) {
            throw e
        }
    }

    async getContract(contractId: number, userId: number): Promise<any> {
        try {
            const contract = await this.prisma.contract.findUnique({ where: { id: contractId } })
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
            const contract = await this.prisma.contract.findMany({ where: { id: contractId, userId } })
            if (!contract) throw new BadRequestException('You have not permission for this contract')
            return this.prisma.contract.update({ where: { id: contractId }, data })
        } catch (e) {
            throw e
        }
    }
}
