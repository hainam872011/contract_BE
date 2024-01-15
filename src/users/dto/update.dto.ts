import { IsIn, IsNumber, IsString, MinLength } from 'class-validator'
import _ from 'lodash'

import { ROLES, STATUS } from '../../constants/const'

export class UpdateDto {
    @IsNumber()
    id: number
    @IsString()
    @MinLength(6)
    password: string
    @IsString()
    @IsIn(_.values(STATUS))
    status: string
    @IsIn(_.values(ROLES))
    role: string
    @IsNumber()
    amountAdded: number
}
