import { Injectable, UnauthorizedException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from './prisma.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({ data: { email: dto.email, displayName: dto.displayName, passwordHash } });
    await this.prisma.notificationPreference.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    if (user.totpSecret && !dto.totpCode) throw new UnauthorizedException('MFA code required');
    return this.issueTokens(user.id, user.email);
  }



  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return { deliveredToMailbox: true };

    const rawToken = randomUUID();
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await fs.mkdir(join(process.cwd(), 'mailbox'), { recursive: true });
    await fs.writeFile(
      join(process.cwd(), 'mailbox', `${Date.now()}-password-reset-${user.email}.json`),
      JSON.stringify({ to: user.email, subject: 'ReefOps password reset', token: rawToken }, null, 2),
    );

    return { deliveredToMailbox: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const resetRecord = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    if (!resetRecord) throw new UnauthorizedException('Invalid or expired reset token');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: await argon2.hash(dto.newPassword) },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: resetRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return this.issueTokens(resetRecord.userId, resetRecord.user.email);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, { secret: process.env.JWT_REFRESH_SECRET ?? 'super-refresh-secret' });
      const stored = await this.prisma.refreshToken.findFirst({ where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
      if (!stored) throw new UnauthorizedException('Refresh session not found');
      const validHash = await argon2.verify(stored.tokenHash, refreshToken);
      if (!validHash) throw new UnauthorizedException('Refresh mismatch');
      await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
      return this.issueTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async issueTokens(sub: string, email: string) {
    const jti = randomUUID();
    const accessToken = await this.jwt.signAsync(
      { sub, email, type: 'access' },
      { secret: process.env.JWT_SECRET ?? 'super-secret', expiresIn: '15m' },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub, email, jti, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET ?? 'super-refresh-secret', expiresIn: '7d' },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: sub,
        tokenHash: await argon2.hash(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    return { accessToken, refreshToken, tokenType: 'Bearer' };
  }
}
