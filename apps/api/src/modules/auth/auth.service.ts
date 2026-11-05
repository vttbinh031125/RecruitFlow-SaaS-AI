import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';
const safeUser = {
  id: true,
  email: true,
  fullName: true,
  platformRole: true,
} as const;
@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly jwt: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72)
      throw new BadRequestException('Password exceeds 72 bytes');
    return this.db.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash: await bcrypt.hash(dto.password, 12),
        candidate: { create: {} },
      },
      select: safeUser,
    });
  }
  async login(dto: LoginDto) {
    const user = await this.db.user.findUnique({ where: { email: dto.email } });
    // Equal hashing work for unknown accounts limits account enumeration through timing.
    const valid = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : (await bcrypt.hash(dto.password, 12), false);
    if (!user || !valid || Buffer.byteLength(dto.password, 'utf8') > 72)
      throw new UnauthorizedException('Invalid email or password');
    return {
      token: await this.jwt.signAsync({ sub: user.id }),
      user: await this.me(user.id),
    };
  }
  me(id: string) {
    return this.db.user.findUniqueOrThrow({ where: { id }, select: safeUser });
  }
}
