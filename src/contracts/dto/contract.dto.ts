import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, MaxLength, Min, MinDate } from 'class-validator'
import { Expose, Transform, Type } from 'class-transformer'
import { DateTime } from 'luxon'

export class ContractDto {
    @Expose()
    @IsString()
    @MaxLength(50)
    customerName: string
    @Expose()
    @IsString()
    @IsOptional()
    @MaxLength(50)
    customerId?: string
    @Expose()
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    addressId?: string
    @Expose()
    @IsString()
    @IsOptional()
    @MaxLength(50)
    phone?: string
    @Expose()
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    address?: string
    @Expose()
    @IsNumber()
    @Min(1)
    loanAmount: number
    @Expose()
    @Min(1)
    @IsNumber()
    receiveAmount: number
    @Expose()
    @IsString()
    period: string
    @Expose()
    @IsNumber()
    @Min(1)
    numberPeriod: number
    @Expose()
    @IsBoolean()
    @IsOptional()
    collectMoney?: boolean
    @Expose()
    @IsNumber()
    @Min(1)
    duration: number
    @Expose()
    @IsString()
    @IsOptional()
    note?: string
    @Expose()
    @IsString()
    @IsOptional()
    @MaxLength(100)
    receiver?: string
    @Expose()
    @IsDate()
    @Type(() => Date)
    @Transform(({ value }) => DateTime.fromJSDate(value).toUTC().startOf('day').toJSDate())
    date: Date
}
