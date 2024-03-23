import { IsNumber, Min } from 'class-validator'
import { Expose } from 'class-transformer'

export class PayFastDto {
    @Expose()
    @Min(1)
    @IsNumber()
    amount: number
}
