import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { ConfigModule } from '@nestjs/config'
import configuration from '../../config/configuration'
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common'
import { SignupDto } from './dto/signup.dto'
import { AuthModule } from '../common/auth/auth.module'
import { PrismaModule } from '../common/connections/prisma.module'
import { JwtModule } from '@nestjs/jwt'
import UserPayload from '../common/auth/user.payload'

describe('UsersController', () => {
    let controller: UsersController
    let service: UsersService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    envFilePath: `${process.cwd()}/config/env/${process.env.ENV || 'local'}.env`,
                    expandVariables: true,
                    load: [configuration],
                }),
                AuthModule,
                PrismaModule,
                JwtModule,
            ],
            controllers: [UsersController],
            providers: [UsersService],
        }).compile()
        controller = module.get<UsersController>(UsersController)
        service = module.get<UsersService>(UsersService)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
    it('validate CreateUserDTO', async () => {
        let target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true })
        const metadata: ArgumentMetadata = {
            type: 'body',
            metatype: SignupDto,
            data: '',
        }
        await target.transform(<SignupDto>{}, metadata).catch((err) => {
            expect(err.getResponse().message).toEqual([
                'userName must be longer than or equal to 3 characters',
                'userName must be a string',
                'password must be longer than or equal to 6 characters',
                'password must be a string',
                'role must be one of the following values: admin, view',
                'amount must be a number conforming to the specified constraints',
            ])
        })
    })
    it('login', async () => {
        const dataLogin = { email: 'admin', password: 'admin' }
        const result = {
            id: 1,
            userName: 'admin',
            token: 'hsdgfjhsdf73764',
            role: 'admin',
        }
        jest.spyOn(service, 'login').mockImplementation(async () => result)
        const res = await controller.login(dataLogin)
        expect(service.login).toBeCalled()
        expect(res.success).toEqual(true)
        expect(res.data.userName).toEqual(result.userName)
        expect(res.data.token).toEqual(result.token)
    })

    it('user detail', async () => {
        const user: UserPayload = {
            id: 1,
            role: 'admin',
            referent: 1,
            userName: 'admin',
        }
        jest.spyOn(service, 'getUser').mockImplementation(async () => {
            return { userName: 'admin' }
        })
        const res = await controller.getUser(user)
        expect(service.getUser).toBeCalled()
        expect(res.success).toEqual(true)
        expect(res.data.userName).toEqual('admin')
    })
})
