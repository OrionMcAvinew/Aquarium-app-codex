import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('returns mailbox success for unknown email without creating token', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(null) },
    } as any;
    const jwt = {} as any;
    const service = new AuthService(prisma, jwt);

    await expect(service.forgotPassword({ email: 'nobody@reefops.local' })).resolves.toEqual({ deliveredToMailbox: true });
  });

  it('rejects reset for invalid token', async () => {
    const prisma = {
      passwordResetToken: { findFirst: jest.fn().mockResolvedValue(null) },
    } as any;
    const jwt = {} as any;
    const service = new AuthService(prisma, jwt);

    await expect(service.resetPassword({ token: 'bad', newPassword: 'ChangeMe123!' })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
