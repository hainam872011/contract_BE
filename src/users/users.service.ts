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
import { ResetPassDto } from './dto/reset-pass.dto'

@Injectable()
export class UsersService {
    constructor(
        private readonly config: ConfigService,
        private prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async createUser(data: SignupDto, user: UserPayload): Promise<boolean> {
        try {
            if ((data.role === ROLES.ADMIN || data.role === ROLES.SUPERADMIN) && user.role === ROLES.ADMIN)
                throw new ForbiddenException('Bạn không có quyền tạo tài khoản quản trị!')
            if (data.role === ROLES.VIEW && user.role === ROLES.SUPERADMIN)
                throw new ForbiddenException('Bạn chỉ có quyền tạo tài khoản quản trị')
            const userExisted = await this.prisma.user.findFirst({ where: { userName: data.userName } })
            if (userExisted) throw new BadRequestException('User name is existed')
            const hash = await bcrypt.hash(data.password, 10)
            await this.prisma.user.create({
                data: {
                    userName: data.userName,
                    role: data.role,
                    referUserId: user.id,
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
            const user = await this.prisma.user.findFirst({ where: { userName: data.email } })
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

    async resetPassword(data: ResetPassDto): Promise<any> {
        try {
            const hash = await bcrypt.hash(data.password, 10)
            await this.prisma.user.update({
                where: { id: data.id },
                data: {
                    password: hash,
                },
            })
            return true
        } catch (e) {
            throw e
        }
    }

    async updateUser(data: UpdateDto, user: UserPayload): Promise<boolean> {
        try {
            const userUpdate = await this.prisma.user.findUnique({ where: { id: data.id } })
            if (!userUpdate) throw new BadRequestException('Tài khoản không tồn tại')
            if (
                (user.role === ROLES.VIEW && user.id !== userUpdate.id) ||
                (user.role === ROLES.ADMIN &&
                    (userUpdate.role === ROLES.SUPERADMIN ||
                        (userUpdate.role === ROLES.ADMIN && user.id !== userUpdate.id)))
            )
                throw new ForbiddenException('Bạn không có quyền update user này')
            const hash = await bcrypt.hash(data.password, 10)
            const amount = data.amountAdded ? userUpdate.amount + data.amountAdded : undefined
            const totalAmount = data.amountAdded ? userUpdate.totalAmount + data.amountAdded : undefined
            await this.prisma.user.update({
                where: { id: data.id },
                data: {
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

    async deleteUser(deleteId: number, user: UserPayload): Promise<any> {
        try {
            const account = await this.prisma.user.findUnique({ where: { id: deleteId } })
            if (
                (user.role === ROLES.SUPERADMIN && account.role === ROLES.SUPERADMIN) ||
                (user.role === ROLES.ADMIN && (account.role === ROLES.SUPERADMIN || account.role === ROLES.ADMIN)) ||
                user.role === ROLES.VIEW
            )
                throw new ForbiddenException('Bạn không có quyền xoá tài khoản này')
            if (user.role === ROLES.SUPERADMIN) {
                return this.prisma.user.deleteMany({
                    where: {
                        id: deleteId,
                        role: { in: [ROLES.VIEW, ROLES.ADMIN] },
                    },
                })
            } else if (user.role === ROLES.ADMIN) {
                return this.prisma.user.deleteMany({
                    where: {
                        referUserId: user.id,
                        id: deleteId,
                        role: ROLES.VIEW,
                    },
                })
            }
        } catch (e) {
            throw e
        }
    }

    async getListUser(user: UserPayload): Promise<any> {
        try {
            const select = {
                id: true,
                userName: true,
                referUserId: true,
                role: true,
                status: true,
                amount: true,
                totalAmount: true,
                createdAt: true,
            }
            if (user.role === ROLES.SUPERADMIN)
                return this.prisma.user.findMany({
                    where: { OR: [{ role: ROLES.VIEW }, { role: ROLES.ADMIN }, { role: ROLES.SUPERADMIN }] },
                    select,
                })
            if (user.role === ROLES.ADMIN)
                return this.prisma.user.findMany({
                    where: { OR: [{ referUserId: user.id }, { id: user.id }] },
                    select,
                })
            if (user.role === ROLES.VIEW)
                return this.prisma.user.findMany({
                    where: { id: user.id },
                    select,
                })
        } catch (e) {
            throw e
        }
    }
}
