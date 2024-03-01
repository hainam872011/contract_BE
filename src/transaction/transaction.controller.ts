import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import { JwtAuthAdminGuard } from '../common/auth/guards/jwt-auth-admin.guard'
import { AuthUser } from '../common/decorators/auth-user.decorator'
import UserPayload from '../common/auth/user.payload'
import { BaseResponse } from '../common/responses/base.response'
import { JwtAuthGeneralGuard } from '../common/auth/guards/jwt-auth-general.guard'
import { TransactionDto } from '../contracts/dto/transaction.dto'

@Controller({
    path: 'transaction',
})
export class TransactionController {
    constructor(private readonly contractsService: TransactionService) {}

    @Get('/:contractId')
    @UseGuards(JwtAuthAdminGuard)
    async getListTrans(@Param('contractId') contractId: string, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.getListTrans(parseInt(contractId), user.id))
    }

    @Post('/:contractId')
    @UseGuards(JwtAuthAdminGuard)
    async createTransaction(
        @Param('contractId') contractId: string,
        @AuthUser() user: UserPayload,
        @Body() data: TransactionDto,
    ): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.createTransaction(parseInt(contractId), user.id, data))
    }
}
