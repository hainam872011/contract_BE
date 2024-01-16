import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ContractsService } from './contracts.service'
import { JwtAuthAdminGuard } from '../common/auth/guards/jwt-auth-admin.guard'
import { AuthUser } from '../common/decorators/auth-user.decorator'
import UserPayload from '../common/auth/user.payload'
import { BaseResponse } from '../common/responses/base.response'
import { ContractDto } from './dto/contract.dto'
import { SearchDto } from './dto/search.dto'
import { Paging } from '../common/responses/paging'

@Controller({
    path: 'contract',
})
export class ContractsController {
    constructor(private readonly contractsService: ContractsService) {}

    @Post()
    @UseGuards(JwtAuthAdminGuard)
    async createContract(@Body() data: ContractDto, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.createContract(data, user.id))
    }

    @Get()
    @UseGuards(JwtAuthAdminGuard)
    async getListContract(@AuthUser() user: UserPayload, @Query() queries: SearchDto): Promise<any> {
        queries.userId = user.id
        const { data, count } = await this.contractsService.getListContract(queries)
        return BaseResponse.ok(data, Paging.build(+queries.page, +queries.pageSize, count))
    }

    @Get('/:id')
    @UseGuards(JwtAuthAdminGuard)
    async getContract(@Param('id') contractId: string, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.getContract(parseInt(contractId), user.id))
    }
}
