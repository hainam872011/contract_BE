import { IsDate, IsOptional, IsString, MaxLength, MinDate } from 'class-validator'
import {Expose, Transform, Type} from 'class-transformer'
import { DateTime } from 'luxon'

export class UpdateContractDto {
    @Expose()
    @IsOptional()
    @IsString()
    @MaxLength(50)
    customerName?: string
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
    @IsString()
    @IsOptional()
    note?: string
    @Expose()
    @IsString()
    @IsOptional()
    @MaxLength(100)
    receiver?: string
    @Expose()
    @IsOptional()
    @IsString()
    @MaxLength(20)
    status?: string
}
