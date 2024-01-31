import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../common/connections/prisma.service'
import { ContractDto } from './dto/contract.dto'

@Injectable()
export class ContractsService {
    constructor(private readonly config: ConfigService, private prisma: PrismaService) {}

    async createContract(data: ContractDto, userId: number): Promise<any> {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } })
            if (!user) throw new BadRequestException('User is not existed')
            if (user.totalAmount < data.loanAmount) throw new BadRequestException('Insufficient money')
            return this.prisma.contract.create({ data: { ...data, userId: userId } })
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
}
