import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('jwtKey'),
                signOptions: { expiresIn: '30m' },
            }),
        }),
    ],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
