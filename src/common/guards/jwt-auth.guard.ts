import {ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // ১. প্রামাণিক এরর চেক
    const request = context.switchToHttp().getRequest();
    console.log('[JwtAuthGuard] handleRequest - headers:', {
      authorization: request.headers?.authorization,
    });
    console.log('[JwtAuthGuard] handleRequest - err:', err);
    console.log('[JwtAuthGuard] handleRequest - info:', info);
    console.log('[JwtAuthGuard] handleRequest - user:', user);

    if (err || !user) {
      console.error('[JwtAuthGuard] Auth Error Info:', info);
      throw err || new UnauthorizedException('Invalid or missing token');
    }

    // ২. রিকোয়েস্টে ডাটা সেট করা
    // নিশ্চিত করুন user অবজেক্টে ডাটা আছে
    request.user = user;
    request.user_id = user.id;
    request.somitee_id = user.somiteeId;
    request.somiteeId = user.somiteeId;

    console.log('[JwtAuthGuard] request.user populated:', request.user);
    return user;
  }
}
