import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Put,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'
import { AuthGuard as AuthUserGuard } from '../../guards/auth.guard'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { Request } from 'express'
import { aes } from '../../utils/crypto.util'

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UsersService,
    ) {}
    @Post('/login')
    async login(
        @Body()
        body: { username: string; password: string },
        @Req() req: Request,
    ) {
        const { username, password } = body

        return await this.userService.loginUser({ username, password }, req)
    }

    @Post('/register')
    async register(
        @Body() body: { username: string; password: string },
        @Req() req: Request,
    ) {
        const { username, password } = body

        return await this.userService.createUser({ username, password }, req)
    }
    @UseGuards(AuthUserGuard)
    @Put('/logout')
    async logout(@Req() req, @Res() res) {
        const token = req.headers.authorization
        if (!token) return res.status(403).send({ ok: false })

        const session = await this.authService.validateSessionByToken(token)

        if (session) {
            this.authService.terminateSession(session.uuid).then(() => {
                return res.send({ ok: true })
            })
        }
    }
    @UseGuards(AuthUserGuard)
    @Get('/sessions')
    async getSessions(@Req() req, @Res() res) {
        const sessions = await this.authService.getUserFromRequest(req)
        if (sessions) {
            return res.send({
                ok: true,
                sessions: sessions,
            })
        }
    }
}
