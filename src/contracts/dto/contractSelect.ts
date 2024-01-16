import { Expose, Transform, Type } from 'class-transformer'

export class ContractSelect {
    @Expose({ name: 'id' })
    id: number
    @Expose({ name: 'user_id' })
    userId: number
    @Expose({ name: 'customer_name' })
    customerName: string
    @Expose({ name: 'customer_id' })
    addressId: string
    @Expose({ name: 'address_id' })
    customerId: string
    @Expose({ name: 'phone' })
    phone: string
    @Expose({ name: 'address' })
    address: string
    @Expose({ name: 'loan_amount' })
    loanAmount: number
    @Expose({ name: 'receive_amount' })
    receiveAmount: number
    @Expose({ name: 'period' })
    period: string
    @Expose({ name: 'number_period' })
    numberPeriod: number
    @Expose({ name: 'duration' })
    duration: number
    @Expose({ name: 'note' })
    note: string
    @Expose({ name: 'receiver' })
    receiver: string
    @Expose({ name: 'status' })
    status: string
    @Expose({ name: 'date_id_card' })
    dateIdCard: string
    @Expose({ name: 'date' })
    date: Date
    @Expose({ name: 'created_at' })
    createdAt: Date
    @Expose({ name: 'updated_at' })
    updatedAt: string
}
