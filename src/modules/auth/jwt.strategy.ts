import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  async validate(payload: unknown) {
    const sub = (payload as Record<string, unknown>).sub;
    let userId: string;

    if (typeof sub === 'bigint' || typeof sub === 'number') {
      userId = sub.toString();
    } else if (typeof sub === 'string') {
      userId = sub;
    } else {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({
      where: {id: BigInt(userId)},
    });

    // const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
      somiteeId: user.somiteeId?.toString(),
    };
  }
}
