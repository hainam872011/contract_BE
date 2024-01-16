import { IsEnum, IsIn, IsNumberString, IsOptional, IsString } from 'class-validator'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { PMS_TYPES, CONTRACT_STATUS } from '../../constants/const'

const statusArr = [CONTRACT_STATUS.DRAFT, CONTRACT_STATUS.PENDING_REVIEW, 'listed', 'unlisted']

export class SearchDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ default: 'property name' })
    name?: string
    @IsOptional()
    @IsString()
    @IsIn(['desc', 'asc'])
    @ApiProperty({ default: 'desc' })
    orderByName?: string
    @IsOptional()
    @IsString()
    @IsIn(['desc', 'asc'])
    @ApiProperty({ default: 'desc' })
    orderByImportedAt?: string
    @IsOptional()
    @IsNumberString()
    @ApiProperty({ default: '1' })
    page?: string = '1'
    @IsOptional()
    @IsNumberString()
    @ApiProperty({ default: '50' })
    pageSize?: string = '50'
    @ApiHideProperty()
    walletId?: string
    @ApiHideProperty()
    userId?: number
    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsEnum(CONTRACT_STATUS)
    publishedStatus?: string
    @ApiProperty()
    @IsOptional()
    crypto?: boolean
    @ApiProperty()
    @IsOptional()
    fiat?: boolean
    @ApiProperty()
    @IsOptional()
    @IsString()
    search?: string
    @ApiProperty()
    @IsOptional()
    @IsIn(statusArr)
    @IsString()
    status?: string
    @ApiProperty()
    @IsOptional()
    @IsIn(Object.values(PMS_TYPES))
    @IsString()
    pmsType?: string
    @ApiProperty()
    @IsOptional()
    @IsString()
    source?: string
    @ApiProperty()
    @IsOptional()
    @IsString()
    channel?: string
    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsIn(['listed', 'unlisted'])
    channelStatus?: string
}
