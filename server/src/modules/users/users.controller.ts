import { Controller, Post, Body } from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from '../../entities/user/User.entity'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
}
