import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UUser } from '../../entities/user/User.entity';

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        return request.user as UUser;
    },
);
