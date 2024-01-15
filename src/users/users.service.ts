import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../common/connections/prisma.service'
import { ROLES, STATUS } from '../constants/const'
import UserPayload from '../common/auth/user.payload'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { SignupDto } from './dto/signup.dto'
import { LoginDto } from './dto/login.dto'
import { UpdateDto } from './dto/update.dto'

@Injectable()
export class UsersService {
    constructor(
        private readonly config: ConfigService,
        private prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async createUser(data: SignupDto, user: UserPayload): Promise<boolean> {
        try {
            const userExisted = await this.prisma.user.findFirst({ where: { userName: data.userName } })
            if (userExisted) throw new BadRequestException('User name is existed')
            const hash = await bcrypt.hash(data.password, 10)
            await this.prisma.user.create({
                data: {
                    userName: data.userName,
                    role: data.role,
                    referUserId: data.role === ROLES.VIEW ? user.id : undefined,
                    password: hash,
                    status: STATUS.ACTIVE,
                    amount: data.amount,
                    totalAmount: data.amount,
                },
            })
            return true
        } catch (e) {
            throw e
        }
    }

    async login(data: LoginDto): Promise<any> {
        try {
            const user = await this.prisma.user.findFirst({ where: { userName: data.userName } })
            if (!user) throw new BadRequestException('User name is incorrect!')
            const isMatch = await bcrypt.compare(data.password, user.password)
            if (!isMatch) throw new BadRequestException('Password is incorrect!')
            const accessToken = this.jwtService.sign({
                id: user.id,
                role: user.role,
                referent: user.referUserId,
                userName: user.userName,
            })
            delete user.password
            return { ...user, accessToken }
        } catch (e) {
            throw e
        }
    }

    async updateUser(data: UpdateDto, user: UserPayload): Promise<boolean> {
        try {
            const userUpdate = await this.prisma.user.findUnique({ where: { id: data.id } })
            if (!userUpdate) throw new BadRequestException('User is not existed')
            if (
                (userUpdate.referUserId !== user.id && userUpdate.role === ROLES.VIEW) ||
                (data.id !== user.id && userUpdate.role === ROLES.ADMIN)
            )
                throw new ForbiddenException('You do not have permission to update this user')
            const hash = await bcrypt.hash(data.password, 10)
            const amount = data.amountAdded ? userUpdate.amount + data.amountAdded : undefined
            const totalAmount = data.amountAdded ? userUpdate.totalAmount + data.amountAdded : undefined
            await this.prisma.user.update({
                where: { id: data.id },
                data: {
                    role: data.role,
                    referUserId: data.role === ROLES.VIEW ? user.id : undefined,
                    password: hash,
                    status: STATUS.ACTIVE,
                    amount,
                    totalAmount,
                },
            })
            return true
        } catch (e) {
            throw e
        }
    }

    async getUser(userId: number): Promise<any> {
        try {
            return this.prisma.user.findUnique({ where: { id: userId } })
        } catch (e) {
            throw e
        }
    }

    async deleteUser(deleteId: number, userId: number): Promise<any> {
        try {
            return this.prisma.user.deleteMany({
                where: {
                    referUserId: userId,
                    id: deleteId,
                    role: ROLES.VIEW,
                },
            })
        } catch (e) {
            throw e
        }
    }

    async getListUser(): Promise<any> {
        try {
            return this.prisma.user.findMany({ where: { OR: [{ role: ROLES.VIEW }, { role: ROLES.ADMIN }] } })
        } catch (e) {
            throw e
        }
    }
}
