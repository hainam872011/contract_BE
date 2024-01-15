import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGeneralGuard extends AuthGuard('jwt-general') {}
