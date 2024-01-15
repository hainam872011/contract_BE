import { IsEmail, IsString } from 'class-validator'

export class LoginDto {
    @IsEmail()
    userName: string
    @IsString()
    password: string
}
