import { IsIn, IsISO8601, IsNumberString, IsOptional, IsString } from 'class-validator'
import { CONTRACT_STATUS } from '../../constants/const'

const statusArr = [
    CONTRACT_STATUS.LATE,
    CONTRACT_STATUS.LAST_DAY,
    CONTRACT_STATUS.ON_TIME,
    CONTRACT_STATUS.EXPIRED,
    CONTRACT_STATUS.PENDING,
    CONTRACT_STATUS.CLOSED,
    CONTRACT_STATUS.DELETED,
]

export class SearchDto {
    @IsOptional()
    @IsString()
    customerName?: string
    @IsOptional()
    @IsISO8601(
        {},
        {
            message: 'startDate is required to be entered in the format yyyy-mm-dd',
        },
    )
    startDate: string
    @IsOptional()
    @IsISO8601(
        {},
        {
            message: 'endDate is required to be entered in the format yyyy-mm-dd',
        },
    )
    endDate: string
    @IsOptional()
    @IsString()
    @IsIn(statusArr)
    status?: string
    @IsOptional()
    @IsNumberString()
    page?: string = '1'
    @IsOptional()
    @IsNumberString()
    pageSize?: string = '50'
}
