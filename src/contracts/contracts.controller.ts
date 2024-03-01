import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ContractsService } from './contracts.service'
import { JwtAuthAdminGuard } from '../common/auth/guards/jwt-auth-admin.guard'
import { AuthUser } from '../common/decorators/auth-user.decorator'
import UserPayload from '../common/auth/user.payload'
import { BaseResponse } from '../common/responses/base.response'
import { ContractDto } from './dto/contract.dto'
import { JwtAuthGeneralGuard } from '../common/auth/guards/jwt-auth-general.guard'
import { SearchDto } from './dto/search.dto'
import { Paging } from '../common/responses/paging'
import { UpdateContractDto } from './dto/updateContract.dto'

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

    @Post('/:id')
    @UseGuards(JwtAuthAdminGuard)
    async updateContract(
        @Param('id') contractId: string,
        @Body() data: UpdateContractDto,
        @AuthUser() user: UserPayload,
    ): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.updateContract(data, user.id, parseInt(contractId)))
    }

    @Get('/:id')
    @UseGuards(JwtAuthGeneralGuard)
    async getContract(@Param('id') contractId: string, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.getContract(parseInt(contractId), user.id))
    }

    @Get()
    @UseGuards(JwtAuthGeneralGuard)
    async getListContract(@AuthUser() user: UserPayload, @Query() queries: SearchDto): Promise<BaseResponse> {
        const { data, count } = await this.contractsService.getListContract(user.id, queries)
        return BaseResponse.ok(data, Paging.build(+queries.page, +queries.pageSize, count))
    }

    @Delete('/:id')
    @UseGuards(JwtAuthAdminGuard)
    async deleteContract(@Param('id') contractId: string, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.deleteContract(parseInt(contractId), user.id))
    }
}
