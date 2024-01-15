import { IsDate, IsNumber, IsOptional, IsString, MaxLength, MinDate } from 'class-validator'
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
    loanAmount: number
    @IsNumber()
    receiveAmount: number
    @IsString()
    period: string
    @IsNumber()
    numberPeriod: number
    @IsNumber()
    duration: number
    @IsString()
    @IsOptional()
    note?: string
    @IsString()
    @IsOptional()
    @MaxLength(100)
    receiver?: string
    @IsString()
    @MaxLength(20)
    status: string
    @IsDate()
    @Type(() => Date)
    @MinDate(DateTime.now().toUTC().startOf('day').toJSDate())
    @Transform(({ value }) => DateTime.fromJSDate(value).toUTC().startOf('day').toJSDate())
    dateIdCard?: Date
    @IsDate()
    @Type(() => Date)
    @MinDate(DateTime.now().toUTC().startOf('day').toJSDate())
    @Transform(({ value }) => DateTime.fromJSDate(value).toUTC().startOf('day').toJSDate())
    date: Date
}
