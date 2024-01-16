import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../common/connections/prisma.service'
import { ContractDto } from './dto/contract.dto'
import { SearchDto } from './dto/search.dto'
import { CONTRACT_STATUS, PAGING } from '../constants/const'
import { Contract } from '@prisma/client'
import { plainToInstance } from 'class-transformer'
import { ContractSelect } from './dto/contractSelect'

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

    async getListContract(queries: SearchDto): Promise<any> {
        let querySearch = `p.is_connected = true AND p.user_id::text = '${queries.userId}'::text`
        if ([CONTRACT_STATUS.PENDING_REVIEW, CONTRACT_STATUS.DRAFT].includes(queries.status))
            querySearch += ` AND p.status::text = '${queries.status}'::text`
        if (queries.status === 'listed') querySearch += ` AND p.is_active::boolean = true`
        if (queries.status === 'unlisted')
            querySearch += ` AND p.is_active::boolean = false AND p.status::text = '${CONTRACT_STATUS.ACTIVE}'::text`
        if (queries.status == undefined)
            querySearch += ` AND p.status IN ('${CONTRACT_STATUS.ACTIVE}', '${CONTRACT_STATUS.DRAFT}', '${CONTRACT_STATUS.PENDING_REVIEW}')`
        if (queries.name) querySearch += ` AND p.external_name::text ILIKE '%${queries.name}%'::text`
        if (queries.source) querySearch += ` AND p.source::text = '${queries.source}'::text`
        if (queries.search) {
            querySearch += ` AND (
                                    p.external_name::text ILIKE '%${queries.search}%'::text OR 
                                    p.internal_name::text ILIKE '%${queries.search}%'::text OR 
                                    p.address::text ILIKE '%${queries.search}%'::text OR 
                                    p.description::text ILIKE '%${queries.search}%'::text
                            )`
        }
        let orderBy = []
        if (queries.orderByName) {
            orderBy.push(`p.name ${queries.orderByName}`)
        }
        if (queries.orderByImportedAt) {
            orderBy.push(`p.imported_at ${queries.orderByImportedAt}`)
        }
        if (orderBy.length === 0) {
            orderBy.push('p.imported_at DESC')
        }
        const queryOrder = orderBy.join(',')
        const limit = +queries.pageSize || PAGING.PAGE_SIZE
        const offset = queries.page ? (+queries.page - 1) * limit : 0

        const [data, count] = await Promise.all([
            this.prisma.$queryRawUnsafe<Contract[]>(
                `
                    SELECT p.*,
                           to_jsonb(pp.*)          as contract_price,
                    FROM view_property_final_status AS p
                             LEFT JOIN contract_price AS pp ON p.id = pp.id
                    WHERE ${querySearch}
                    ORDER BY ${queryOrder} LIMIT ${limit}
                    OFFSET ${offset}
                `,
            ),
            this.prisma.$queryRawUnsafe(
                `
                    SELECT COUNT(*)
                    FROM view_property_final_status AS p
                             LEFT JOIN remote_property_channel_mapping as pcs ON pcs.property_id = p.id
                    WHERE ${querySearch}
                `,
            ),
        ])
        return {
            data: plainToInstance(ContractSelect, data, { excludeExtraneousValues: true }),
            count: Number(count[0].count),
        }
    }
}
