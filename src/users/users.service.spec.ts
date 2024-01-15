import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { ConfigModule } from '@nestjs/config'
import configuration from '../../config/configuration'
import { PrismaModule } from '../common/connections/prisma.module'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { UsersController } from './users.controller'
import { PrismaService } from '../common/connections/prisma.service'
import { ArgumentMetadata, BadRequestException, ValidationPipe } from '@nestjs/common'
import { SignupDto } from './dto/signup.dto'
import * as bcrypt from 'bcrypt'

describe('UsersService', () => {
    let service: UsersService
    let jwtService: JwtService
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    envFilePath: `${process.cwd()}/config/env/${process.env.ENV || 'local'}.env`,
                    expandVariables: true,
                    load: [configuration],
                }),
                PrismaModule,
                JwtModule,
            ],
            controllers: [UsersController],
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useFactory: () => ({
                        user: {
                            update: jest.fn(),
                            findUnique: jest.fn().mockImplementation((args) => {
                                return Promise.resolve({ id: 1, userName: 'admin', role: 'admin' })
                            }),
                            findMany: jest.fn().mockImplementation((args) => {
                                return Promise.resolve([
                                    { id: 1, userName: 'admin', role: 'admin' },
                                    { id: 2, userName: 'view', role: 'view' },
                                ])
                            }),
                            findFirst: jest.fn().mockImplementation((args) => {
                                return Promise.resolve({ id: 1, userName: 'admin', role: 'admin', password: 'admin' })
                            }),
                        },
                    }),
                },
                {
                    provide: bcrypt,
                    useFactory: () => ({
                        compare: jest.fn().mockImplementation((args) => {
                            return Promise.resolve(true)
                        }),
                    }),
                },
            ],
        }).compile()
        service = module.get<UsersService>(UsersService)
        jwtService = module.get<JwtService>(JwtService)
    })
    it('get user detail', async () => {
        const res = await service.getUser(1)
        expect(res.userName).toEqual('admin')
    })
    it('get list user', async () => {
        const res = await service.getListUser()
        expect(Array.isArray(res)).toBe(true)
    })
    it('login throw error', async () => {
        const dataLogin = { email: 'admin', password: 'admin' }
        await expect(() => service.login(dataLogin)).rejects.toThrowError(BadRequestException)
    })
})
