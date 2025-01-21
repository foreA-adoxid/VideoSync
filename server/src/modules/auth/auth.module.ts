import { forwardRef, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service'
import { User } from '../../entities/user/User.entity'
import { Video } from '../../entities/video/Video.entity'
import { UsersModule } from '../users/users.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Video]),
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => {
                return {
                    secret: configService.get<string>('SECRET_TOKEN'),
                    signOptions: { expiresIn: '7d' },
                }
            },
            inject: [ConfigService],
        }),
        forwardRef(() => UsersModule),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
