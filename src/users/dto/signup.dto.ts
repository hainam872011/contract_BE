import { IsIn, IsNumber, IsString, MinLength } from 'class-validator'
import _ from 'lodash'

import { ROLES } from '../../constants/const'

export class SignupDto {
    @IsString()
    @MinLength(3)
    userName: string
    @IsString()
    @MinLength(6)
    password: string
    @IsIn(_.values(ROLES))
    role: string
    @IsNumber()
    amount: number
}
