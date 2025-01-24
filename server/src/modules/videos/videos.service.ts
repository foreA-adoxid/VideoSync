import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Video } from '../../entities/video/Video.entity'
import { User } from '../../entities/user/User.entity'
import * as fs from 'node:fs'
import * as crypto from 'crypto'
import { join } from 'node:path'
import { md5 } from '../../utils/crypto.util'

@Injectable()
export class VideosService {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getAllVideos(): Promise<Video[]> {
        return this.videoRepository.find()
    }

    async getVideoById(id: number): Promise<Video> {
        return this.videoRepository.findOne({ where: { id } })
    }
    async uploadVideo(
        userId: string,
        title: string,
        description: string,
        buffer: Buffer,
        originalName: string,
        extension: string,
    ): Promise<Video> {
        const user = await this.userRepository.findOne({ where: { id: userId } })
        if (!user) {
            throw new BadRequestException('User not found')
        }
        const hash = await this.computeBufferHash(buffer)

        const existingVideo = await this.videoRepository.findOne({ where: { hash } })
        if (existingVideo) {
            throw new BadRequestException(
                'Duplicate video: this file already exists',
            )
        }

        const filePath = this.saveFile(buffer, hash, extension)

        const newVideo = this.videoRepository.create({
            title,
            description,
            filePath,
            hash,
            user,
        })
        return this.videoRepository.save(newVideo)
    }

    private async computeBufferHash(buffer: Buffer): Promise<string> {
        return await md5.hashFile(buffer)
    }

    private saveFile(buffer: Buffer, hash: string, extension: string): string {
        const uploadPath = join(__dirname, '../../../uploads')
        fs.mkdirSync(uploadPath, { recursive: true })

        const filePath = join(uploadPath, `${hash}${extension}`)
        fs.writeFileSync(filePath, buffer)

        return filePath
    }
}
