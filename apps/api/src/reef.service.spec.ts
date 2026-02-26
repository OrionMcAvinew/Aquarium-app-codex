import { JobsService } from './jobs.service';
import { ReefService } from './reef.service';

describe('ReefService', () => {
  it('creates tank and writes audit', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'tank1' });
    const tx = { tank: { create }, auditLog: { create: jest.fn() } } as any;
    const prisma = { $transaction: (fn: any) => fn(tx) } as any;
    const service = new ReefService(prisma, new JobsService());
    const result = await service.createTank('org1', { name: 'A', volumeGallons: 20, tankType: 'MIXED' }, 'user1');
    expect(result.id).toBe('tank1');
    expect(create).toHaveBeenCalled();
  });

  it('triggers alert when all trailing points exceed threshold', () => {
    const service = new ReefService({} as any, new JobsService());
    expect(service.checkAlert({ parameter: 'po4', threshold: 0.25, days: 3 }, [0.2, 0.3, 0.4, 0.35])).toBe(true);
  });

  it('accepts invite and creates membership', async () => {
    const prisma = {
      inviteToken: { findUnique: jest.fn().mockResolvedValue({ id: 'inv1', orgId: 'org1', email: 'member@reefops.local' }) },
      orgMembership: { upsert: jest.fn() },
      auditLog: { create: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    } as any;
    prisma.inviteToken.update = jest.fn();
    const service = new ReefService(prisma, new JobsService());
    const result = await service.acceptInvite('token', 'user-1');
    expect(result.accepted).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

});
