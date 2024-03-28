import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards, ValidationPipe } from '@nestjs/common'
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
import { PayFastDto } from './dto/payFast.dto'

@Controller({
    path: 'contract',
})
export class ContractsController {
    constructor(private readonly contractsService: ContractsService) {}

    @Post()
    @UseGuards(JwtAuthAdminGuard)
    async createContract(
        @Body(
            new ValidationPipe({
                transform: true,
                transformOptions: { excludeExtraneousValues: true },
            }),
        )
        data: ContractDto,
        @AuthUser() user: UserPayload,
    ): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.createContract(data, user.id))
    }

    @Put('/:id')
    @UseGuards(JwtAuthAdminGuard)
    async updateContract(
        @Param('id') contractId: string,
        @Body(
            new ValidationPipe({
                transform: true,
                transformOptions: { excludeExtraneousValues: true },
            }),
        ) data: UpdateContractDto,
        @AuthUser() user: UserPayload,
    ): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.updateContract(data, user.id, parseInt(contractId)))
    }

    // @Get('/export')
    // @UseGuards(JwtAuthGeneralGuard)
    // async giveback(@Query() searchDto: SearchDto, @AuthUser() user: UserPayload, @Res() res): Promise<any> {
    //     const { data } = await this.contractsService.getListContract(user.id, searchDto)
    //     const fields = [
    //         {
    //             label: 'User wallet address',
    //             value: 'hostWallet',
    //         },
    //         {
    //             label: 'User email',
    //             value: 'userEmail',
    //         },
    //         {
    //             label: 'Reservation ID',
    //             value: 'reservationIdFormat',
    //         },
    //         {
    //             label: 'Booking date',
    //             value: 'reservationDate',
    //         },
    //         {
    //             label: 'Checkin date',
    //             value: 'checkinDate',
    //         },
    //         {
    //             label: 'Checkout date',
    //             value: 'checkoutDate',
    //         },
    //         {
    //             label: 'No. of nights',
    //             value: 'nights',
    //         },
    //         {
    //             label: 'Booking value',
    //             value: 'finalPrice',
    //         },
    //         {
    //             label: 'Booking Currency',
    //             value: 'currency',
    //         },
    //         {
    //             label: 'Giveback Amount',
    //             value: 'giveback',
    //         },
    //         {
    //             label: 'Giveback Amount (TRVL)',
    //             value: 'giveBackTRVL',
    //         },
    //         {
    //             label: 'Current Wallet Type',
    //             value: 'walletType',
    //         },
    //         {
    //             label: 'Current Network',
    //             value: 'network',
    //         },
    //         {
    //             label: 'Current Address',
    //             value: 'currentAddress',
    //         },
    //     ]
    //     const fieldsGroupByUser = [
    //         {
    //             label: 'User wallet address',
    //             value: 'hostWallet',
    //         },
    //         {
    //             label: 'User email',
    //             value: 'userEmail',
    //         },
    //         {
    //             label: 'No. of nights',
    //             value: 'nights',
    //         },
    //         {
    //             label: 'Giveback Amount (TRVL)',
    //             value: 'giveBackTRVL',
    //         },
    //     ]
    //     const json2csvParser = new Parser({ fields: fields })
    //     const csvString = json2csvParser.parse(result)
    //     res.setHeader('Content-disposition', 'attachment; filename=giveback.csv')
    //     res.set('Content-Type', 'text/csv')
    //     res.status(200).send(csvString)
    // }

    @Get('/:id')
    @UseGuards(JwtAuthGeneralGuard)
    async getContract(@Param('id') contractId: string, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.getContract(parseInt(contractId), user.id))
    }

    @Get()
    @UseGuards(JwtAuthGeneralGuard)
    async getListContract(@AuthUser() user: UserPayload, @Query() queries: SearchDto): Promise<BaseResponse> {
        const { result, count } = await this.contractsService.getListContract(user.id, queries)
        return BaseResponse.ok(result, Paging.build(+queries.page, +queries.pageSize, count))
    }

    @Delete('/:id')
    @UseGuards(JwtAuthAdminGuard)
    async deleteContract(@Param('id') contractId: string, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.deleteContract(parseInt(contractId), user.id))
    }
    @Post('/:id/pay-fast')
    @UseGuards(JwtAuthAdminGuard)
    async payFast(
        @Param('id') contractId: string,
        @AuthUser() user: UserPayload,
        @Body() data: PayFastDto,
    ): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.payFast(parseInt(contractId), user.id, data))
    }

    @Post('/:id/change-contract')
    @UseGuards(JwtAuthAdminGuard)
    async changeContract(
        @Param('id') contractId: string,
        @AuthUser() user: UserPayload,
        @Body() data: ContractDto,
    ): Promise<BaseResponse> {
        return BaseResponse.ok(await this.contractsService.changeContract(parseInt(contractId), user.id, data))
    }
}
