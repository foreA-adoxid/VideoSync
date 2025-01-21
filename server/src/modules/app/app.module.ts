import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as path from 'node:path'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { VideosModule } from '../videos/videos.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis'
import { AuthService } from '../auth/auth.service'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import { join } from 'node:path'
import { ServeStaticModule } from '@nestjs/serve-static'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.getOrThrow<string>('DATABASE_HOST'),
                port: config.getOrThrow<number>('DATABASE_PORT'),
                username: config.getOrThrow<string>('DATABASE_USER'),
                password: config.getOrThrow<string>('DATABASE_PASSWORD'),
                database: config.getOrThrow<string>('DATABASE_NAME'),
                entities: [
                    path.join(__dirname + '/../../entities/*/*.entity{.ts,.js}'),
                ],
                autoLoadEntities: true,
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => [
                {
                    ttl: 1,
                    limit: 15,
                    storage: new ThrottlerStorageRedisService({
                        host: config.getOrThrow<string>('REDIS_HOST'),
                        port: config.getOrThrow<number>('REDIS_PORT'),
                        password: config.getOrThrow<string>('REDIS_PASSWORD'),
                    }),
                },
            ],
        }),
        RedisModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (conf: ConfigService) => ({
                readyLog: true,
                config: {
                    host: conf.getOrThrow('REDIS_HOST'),
                    port: conf.getOrThrow('REDIS_PORT'),
                    password: conf.getOrThrow('REDIS_PASSWORD'),
                },
            }),
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot: '/uploads',
        }),
        AuthModule,
        UsersModule,
        VideosModule,
    ],
    controllers: [AppController],
    providers: [AppService, JwtService],
})
export class AppModule {}
