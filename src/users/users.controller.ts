import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'

import { BaseResponse } from '../common/responses/base.response'
import { UsersService } from './users.service'
import { JwtAuthAdminGuard } from '../common/auth/guards/jwt-auth-admin.guard'
import UserPayload from '../common/auth/user.payload'
import { AuthUser } from '../common/decorators/auth-user.decorator'
import { UpdateDto } from './dto/update.dto'
import { SignupDto } from './dto/signup.dto'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGeneralGuard } from '../common/auth/guards/jwt-auth-general.guard'
import { ResetPassDto } from './dto/reset-pass.dto'
import { AddMoneyDto } from './dto/add-money.dto'

@Controller({
    path: 'user',
})
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @UseGuards(JwtAuthAdminGuard)
    async signup(@Body() data: SignupDto, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.usersService.createUser(data, user))
    }

    @Post('login')
    async login(@Body() data: LoginDto): Promise<BaseResponse> {
        return BaseResponse.ok(await this.usersService.login(data))
    }

    @Post('reset-password')
    @UseGuards(JwtAuthGeneralGuard)
    async resetPassword(@Body() data: ResetPassDto, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.usersService.resetPassword(data, user))
    }

    @Post('capital')
    @UseGuards(JwtAuthAdminGuard)
    async addMoney(@Body() data: AddMoneyDto, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.usersService.addMoney(user.id, data))
    }

    @Put()
    @UseGuards(JwtAuthAdminGuard)
    async updateUser(@Body() data: UpdateDto, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.usersService.updateUser(data, user))
    }

    @Get()
    @UseGuards(JwtAuthGeneralGuard)
    async getUser(@AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.usersService.getUser(user.id))
    }

    @Delete('/:id')
    @UseGuards(JwtAuthAdminGuard)
    async deleteUser(@Param('id') deleteId: string, @AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.usersService.deleteUser(parseInt(deleteId), user))
    }

    @Get('/list-user')
    @UseGuards(JwtAuthGeneralGuard)
    async getListUser(@AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.usersService.getListUser(user))
    }

    @Get('/statistics')
    @UseGuards(JwtAuthGeneralGuard)
    async getStatistics(@AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.usersService.getStatistics(user.id))
    }
    @Get('/transactionInDay')
    @UseGuards(JwtAuthGeneralGuard)
    async transactionInDay(@AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.usersService.transactionInDay(user.id))
    }

    @Get('/capital')
    @UseGuards(JwtAuthGeneralGuard)
    async listTransactionAddMoney(@AuthUser() user: UserPayload): Promise<BaseResponse> {
        return BaseResponse.ok(await this.usersService.listTransactionAddMoney(user.id))
    }
}
