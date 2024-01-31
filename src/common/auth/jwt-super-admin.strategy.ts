import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { plainToClass } from 'class-transformer'

import UserPayload from './user.payload'
import { ROLES } from '../../constants/const'

@Injectable()
export default class JWTAdminStrategy extends PassportStrategy(Strategy, 'jwt-super-admin') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_KEY,
        })
    }

    validate(userPayload: Record<string, any>): UserPayload {
        const role = userPayload.role
        if (role === ROLES.SUPERADMIN) return plainToClass(UserPayload, userPayload)
        if (role === ROLES.VIEW || role === ROLES.ADMIN)
            throw new ForbiddenException('Bạn không có quyền thực hiện thao tác')
        throw new UnauthorizedException()
    }
}
