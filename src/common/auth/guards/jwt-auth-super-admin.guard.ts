import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthSuperAdminGuard extends AuthGuard('jwt-super-admin') {}
