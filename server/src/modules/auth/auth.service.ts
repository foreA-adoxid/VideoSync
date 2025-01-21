import {
    forwardRef,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import Redis from 'ioredis'
import Session from './session'
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express'
import { sign, verify, JwtPayload } from 'jsonwebtoken'
import { UsersService } from '../users/users.service'
import { ConfigService } from '@nestjs/config'
import getUserIP from '../../utils/getUserIP'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { aes, md5 } from '../../utils/crypto.util'

@Injectable()
export class AuthService {
    private readonly redis: Redis

    constructor(
        private readonly redisService: RedisService,
        @Inject(forwardRef(() => UsersService)) private userService: UsersService,
        @Inject(ConfigService) private configService: ConfigService,
    ) {
        this.redis = this.redisService.getOrThrow()
    }
    public readonly MAX_SESSIONS = 3

    async createSession(userId: string, req: Request): Promise<string> {
        const user = await this.userService.findUserById(userId)
        if (!user) {
            throw new Error('User not found')
        }
        const expiresAt = Date.now() + 1209600 * 1000

        if (user.sessions.length >= this.MAX_SESSIONS) {
            for (const sessionId of user.sessions) {
                await this.redis.del(`videosync-${sessionId}`)
            }
            user.sessions = []
        }

        const session: Session = {
            uuid: uuidv4(),
            ip: getUserIP(req),
            ua: req.headers['user-agent'],
            expiresIn: expiresAt,
            userId,
            closed: false,
        }

        await this.redis.set(
            `videosync-${session.uuid}`,
            JSON.stringify(session),
            'EX',
            1209600,
        )
        user.sessions.push(session.uuid)
        await user.save()

        return this.generateJwt(session.uuid)
    }

    private generateJwt(sessionId: string): string {
        return sign(
            { uuid: sessionId },
            this.configService.getOrThrow('SECRET_TOKEN'),
            { expiresIn: '7d' },
        )
    }

    private async decodeJwt(token: string): Promise<string | null> {
        try {
            const payload = verify(
                token,
                this.configService.getOrThrow('SECRET_TOKEN'),
            ) as JwtPayload
            return payload.uuid
        } catch {
            return null
        }
    }

    async terminateSession(uuid: string): Promise<void> {
        const session = await this.fetchSession(uuid)
        if (!session) return

        const user = await this.userService.findUserById(session.userId)
        if (!user) return
        user.sessions = user.sessions.filter((id) => id !== uuid)

        await this.redis.del(uuid)
        await user.save()
    }

    async fetchSession(uuid: string): Promise<Session | null> {
        const sessionData = await this.redis.get(uuid)
        return sessionData ? JSON.parse(sessionData) : null
    }

    async validateSessionByToken(token: string): Promise<Session | null> {
        const sessionId = await this.decodeJwt(token)
        const session = sessionId ? await this.fetchSession(sessionId) : null

        return session && (await this.isSessionActive(session)) ? session : null
    }

    async validateSessionByReq(req: Request): Promise<Session | null> {
        const token = req.headers.authorization?.split(' ')[1]
        const sessionId = await this.decodeJwt(token)
        const session = sessionId ? await this.fetchSession(sessionId) : null

        return session && (await this.isSessionActive(session)) ? session : null
    }

    // async authorizeRequest(req: Request): Promise<boolean> {
    //     const token = req.headers.authorization?.split(' ')[1]
    //     const session = token ? await this.validateSessionByToken(token) : null
    //
    //     return session
    //         ? await this.isValidSessionAttributes(session, req)
    //         : false
    // }

    private async isValidSessionAttributes(
        session: Session,
        req: Request,
    ): Promise<boolean> {
        const isSameDevice =
            session.ua === req.headers['user-agent'] && session.ip === getUserIP(req)
        if (!isSameDevice || session.closed || Date.now() > session.expiresIn) {
            await this.terminateSession(session.uuid)
            return false
        }

        return !!(await this.userService.findUserById(session.userId))
    }

    private async isSessionActive(session: Session): Promise<boolean> {
        const user = await this.userService.findUserById(session.userId)
        if (!user || session.closed || Date.now() > session.expiresIn) {
            await this.terminateSession(session.uuid)
            return false
        }
        return true
    }

    async getUserFromRequest(req: Request) {
        const token = req.headers.authorization?.split(' ')[1]
        const session = token ? await this.validateSessionByToken(token) : null
        return session ? await this.userService.findUserById(session.userId) : null
    }

    async listUserSessions(userId: string): Promise<Session[]> {
        const user = await this.userService.findUserById(userId)
        if (!user) return []

        const sessions = await Promise.all(
            user.sessions.map((uuid) => this.fetchSession(uuid)),
        )
        return sessions.filter((session) => session) as Session[]
    }
    public async checkPassword(userPass: string, encryptedPassword: string) {
        const passwordHash = md5.hash(encryptedPassword)
        return userPass === passwordHash
    }
}
