import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Inject,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { AuthService } from '../modules/auth/auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService,
        @Inject(ConfigService) private readonly configService: ConfigService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: Request = context.switchToHttp().getRequest()
        const perms = this.reflector.get<string[]>('perms', context.getHandler())

        if (!req.headers.authorization) {
            throw new HttpException(
                'Authorization header missing',
                HttpStatus.UNAUTHORIZED,
            )
        }

        if (this.configService.get('NODE_ENV') !== 'development') {
            if (req.headers.origin === 'http://localhost:3000') {
                throw new HttpException('Unauthorized origin', HttpStatus.FORBIDDEN)
            }
        }

        const user = await this.authService.getUserFromRequest(req)
        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.UNAUTHORIZED)
        }

        ;(req as any).user = user

        if (!perms) {
            return true
        }

        if (perms[0] === 'NON_DEFAULT') {
            return user.perms !== 'default'
        }

        return perms.includes(user.perms)
    }
}
