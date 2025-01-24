import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user/User.entity';
import { AuthService } from '../auth/auth.service';

describe('UsersService', () => {
    let service: UsersService;
    let userRepository: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
                {
                    provide: AuthService,
                    useValue: {
                        someMethod: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOne', () => {
        it('should find a user by username', async () => {
            const username = 'testUser';
            const mockUser = { id: '1', username: 'testUser' } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

            const result = await service.findOne(username);
            expect(result).toEqual(mockUser);
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username } });
        });
    });

    describe('findUserById', () => {
        it('should find a user by ID', async () => {
            const userId = '1';
            const mockUser = { id: '1', username: 'testUser', ban: null } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

            const result = await service.findUserById(userId);
            expect(result).toEqual(mockUser);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: userId },
                relations: ['ban'],
            });
        });
    });
});