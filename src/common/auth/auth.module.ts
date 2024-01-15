import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import JWTAdminStrategy from './jwt-admin.strategy'
import JWTGuestStrategy from './jwt-guest.strategy'
import JWTGeneralStrategy from './jwt-general.strategy'

@Module({
    imports: [PassportModule, ConfigModule],
    controllers: [],
    providers: [JWTAdminStrategy, JWTGuestStrategy, ConfigService, JWTGeneralStrategy],
    exports: [],
})
export class AuthModule {}
