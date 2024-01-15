import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { plainToClass } from 'class-transformer'

import UserPayload from './user.payload'
import { ROLES } from '../../constants/const'

@Injectable()
export default class JWTGuestStrategy extends PassportStrategy(Strategy, 'jwt-guest') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_KEY,
        })
    }

    validate(userPayload: Record<string, any>): UserPayload {
        const role = userPayload.role
        if (role === ROLES.VIEW) return plainToClass(UserPayload, userPayload)
        throw new UnauthorizedException()
    }
}
