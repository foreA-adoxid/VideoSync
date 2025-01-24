import { Test, TestingModule } from '@nestjs/testing';
import { VideosService } from './videos.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Video } from '../../entities/video/Video.entity';
import { User } from '../../entities/user/User.entity';

describe('VideosService', () => {
    let service: VideosService;
    let videoRepository: Repository<Video>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VideosService,
                {
                    provide: getRepositoryToken(Video),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<VideosService>(VideosService);
        videoRepository = module.get<Repository<Video>>(getRepositoryToken(Video));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllVideos', () => {
        it('should return all videos', async () => {
            const mockVideos = [
                { id: 1, title: 'Video 1' } as Video,
                { id: 2, title: 'Video 2' } as Video,
            ];

            jest.spyOn(videoRepository, 'find').mockResolvedValue(mockVideos);

            const result = await service.getAllVideos();
            expect(result).toEqual(mockVideos);
            expect(videoRepository.find).toHaveBeenCalled();
        });
    });

    describe('getVideoById', () => {
        it('should return a video by ID', async () => {
            const videoId = 1;
            const mockVideo = { id: 1, title: 'Video 1' } as Video;

            jest.spyOn(videoRepository, 'findOne').mockResolvedValue(mockVideo);

            const result = await service.getVideoById(videoId);
            expect(result).toEqual(mockVideo);
            expect(videoRepository.findOne).toHaveBeenCalledWith({ where: { id: videoId } });
        });
    });
});