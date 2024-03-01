import { IsDate, IsNumber, IsOptional, IsString, MaxLength, Min, MinDate } from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { DateTime } from 'luxon'

export class TransactionDto {
    @IsDate()
    @Type(() => Date)
    @Transform(({ value }) => DateTime.fromJSDate(value).toUTC().startOf('day').toJSDate())
    date: Date
    @IsNumber()
    @Min(1)
    amount: number
}
