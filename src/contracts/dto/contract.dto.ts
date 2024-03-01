import {IsDate, IsNumber, IsOptional, IsString, MaxLength, Min, MinDate} from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { DateTime } from 'luxon'

export class ContractDto {
    @IsString()
    @MaxLength(50)
    customerName: string
    @IsString()
    @IsOptional()
    @MaxLength(50)
    customerId?: string
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    addressId?: string
    @IsString()
    @IsOptional()
    @MaxLength(50)
    phone?: string
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    address?: string
    @IsNumber()
    @Min(1)
    loanAmount: number
    @Min(1)
    @IsNumber()
    receiveAmount: number
    @IsString()
    period: string
    @IsNumber()
    @Min(1)
    numberPeriod: number
    @IsNumber()
    @Min(1)
    duration: number
    @IsString()
    @IsOptional()
    note?: string
    @IsString()
    @IsOptional()
    @MaxLength(100)
    receiver?: string
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    @Transform(({ value }) => DateTime.fromJSDate(value).toUTC().startOf('day').toJSDate())
    dateIdCard?: Date
    @IsDate()
    @Type(() => Date)
    @Transform(({ value }) => DateTime.fromJSDate(value).toUTC().startOf('day').toJSDate())
    date: Date
}
