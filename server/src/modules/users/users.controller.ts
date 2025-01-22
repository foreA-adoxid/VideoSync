import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service'
import { User } from '../../entities/user/User.entity'
import { AuthGuard } from '../../guards/auth.guard';
import { User as usr } from './user.paramdecorator'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(AuthGuard)
    @Get('/profile/me')
    async getProfile(@usr() user: User) {
        return user
    }
}
