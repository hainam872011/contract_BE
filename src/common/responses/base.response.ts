import { Paging } from './paging'
import { ErrorResponse } from './error.response'

export class BaseResponse {
    public success: boolean
    public data: any
    public error?: ErrorResponse
    public paging?: Paging

    public static ok(data: any, paging?: Paging): BaseResponse {
        return <BaseResponse>{ success: true, data, paging }
    }

    public static error(data: any, error: ErrorResponse): BaseResponse {
        return <BaseResponse>{ success: false, data, error }
    }
}
