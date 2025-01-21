import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VideosController } from './videos.controller'
import { VideosService } from './videos.service'
import { Video } from '../../entities/video/Video.entity'
import { User } from '../../entities/user/User.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Video, User])],
    controllers: [VideosController],
    providers: [VideosService],
})
export class VideosModule {}
