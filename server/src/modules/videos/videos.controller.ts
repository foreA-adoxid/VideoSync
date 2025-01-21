import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Res,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
} from '@nestjs/common'
import { VideosService } from './videos.service'
import { Response } from 'express'
import * as fs from 'fs'
import { Video } from '../../entities/video/Video.entity'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'

@Controller('videos')
export class VideosController {
    constructor(private readonly videosService: VideosService) {}

    @Get()
    async getAllVideos(): Promise<Video[]> {
        return this.videosService.getAllVideos()
    }

    @Get(':id/stream')
    async streamVideo(@Param('id') id: string, @Res() res: Response) {
        const video = await this.videosService.getVideoById(+id)
        if (!video) {
            res.status(404).send('Video not found')
            return
        }

        const filePath = video.filePath
        const stat = fs.statSync(filePath)

        res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Content-Length': stat.size,
        })

        const readStream = fs.createReadStream(filePath)
        readStream.pipe(res)
    }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: (req, file, callback) => {
                const allowedMimeTypes = [
                    'video/mp4',
                    'video/mkv',
                    'video/avi',
                    'video/webm',
                ]
                if (!allowedMimeTypes.includes(file.mimetype)) {
                    return callback(
                        new BadRequestException('Only video files are allowed'),
                        false,
                    )
                }
                callback(null, true)
            },
        }),
    )
    async uploadVideo(
        @Body('userId') userId: string,
        @Body('title') title: string,
        @Body('description') description: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded')
        }

        return this.videosService.uploadVideo(
            userId,
            title,
            description,
            file.buffer,
            file.originalname,
            extname(file.originalname),
        )
    }
}
