import { IsNumber, IsString } from 'class-validator'

export class AddMoneyDto {
    @IsNumber()
    amount: number
    @IsString()
    name: string
    @IsString()
    note: string
}
