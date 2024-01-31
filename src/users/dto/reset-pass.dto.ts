import { IsNumber, IsString } from 'class-validator'

export class ResetPassDto {
    @IsString()
    password: string
    @IsNumber()
    id: number
}
