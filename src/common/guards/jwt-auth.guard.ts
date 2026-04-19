import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    request.user = user;
    request.user_id = user.id;
    request.somitee_id = user.somiteeId;
    request.somiteeId = user.somiteeId;
    return user;
  }
}
