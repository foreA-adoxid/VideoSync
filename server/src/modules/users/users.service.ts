import {
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import getUserIP from '../../utils/getUserIP'
import { aes, md5 } from '../../utils/crypto.util'
import { AuthService } from '../auth/auth.service'
import { Request } from 'express'
import { User } from '../../entities/user/User.entity'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject(forwardRef(() => AuthService)) private authService: AuthService,
    ) {}

    async findOne(username: string): Promise<User> {
        return this.userRepository.findOne({ where: { username } })
    }
    async findUserById(arg: string) {
        return await this.userRepository.findOne({
            where: {
                id: arg,
            },
            relations: ['ban'],
        })
    }
    public async createUser(
        body: { username: string; password: string },
        req: Request,
    ) {
        try {
            if (body.password.length < 12) {
                throw new HttpException('PASSWORD_TOO_SHORT', HttpStatus.BAD_REQUEST)
            }

            const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/
            if (!usernameRegex.test(body.username)) {
                throw new HttpException('INVALID_USERNAME', HttpStatus.BAD_REQUEST)
            }

            if (body.username.length > 25) {
                throw new HttpException('USERNAME_TOO_LONG', HttpStatus.BAD_REQUEST)
            }

            const existingUser = await this.findByUsername(body.username)
            if (existingUser) {
                throw new HttpException('USERNAME_BUSY', HttpStatus.FORBIDDEN)
            }

            const hashedPassword = md5.hash(body.password)

            const user = User.create({
                username: body.username,
                password: hashedPassword,
                createdAt: Date.now().toString(),
                ips: [getUserIP(req)],
            })

            const savedUser = await user.save()
            if (savedUser) {
                return { ok: true }
            } else {
                throw new HttpException(
                    'INTERNAL_SERVER_ERROR',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                )
            }
        } catch (error) {
            console.error(error)
            throw new HttpException(
                'INTERNAL_SERVER_ERROR',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    public async loginUser(
        body: { username: string; password: string },
        req: Request,
    ) {
        const { username, password } = body

        const user = await this.findByUsername(username)
        if (!user) {
            throw new HttpException('USER_NOT_FOUND', HttpStatus.FORBIDDEN)
        }

        const isPasswordValid = await this.authService.checkPassword(
            user.password,
            password,
        )
        if (!isPasswordValid) {
            throw new HttpException('PASSWORD_DENY', HttpStatus.FORBIDDEN)
        }

        if (user.ban) {
            throw new HttpException('USER_BANNED', HttpStatus.FORBIDDEN)
        }

        const ip = getUserIP(req)
        user.ips = user.ips.includes(ip) ? user.ips : [...user.ips, ip]
        const token = await this.authService.createSession(user.id, req)

        if (token) {
            await user.save()
            return {
                ok: true,
                token,
            }
        } else {
            throw new HttpException(
                'INTERNAL_SERVER_ERROR',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    private async findByUsername(username: string): Promise<User | null> {
        return await User.findOne({ where: { username } })
    }
}
