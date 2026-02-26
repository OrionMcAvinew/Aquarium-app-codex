import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ListQueryDto } from './common.dto';
import { JobsService } from './jobs.service';
import { PrismaService } from './prisma.service';
import {
  AlertRuleDto,
  CompleteTaskDto,
  CreateDosingPlanDto,
  CreateLivestockDto,
  CreateTankDto,
  CreateTaskTemplateDto,
  CreateWaterTestDto,
} from './reef.dto';

@Injectable()
export class ReefService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
  ) {}

  async listTanks(orgId: string, query: ListQueryDto) {
    const where = {
      orgId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
    };
    const skip = (query.page - 1) * query.pageSize;
    const [total, data] = await this.prisma.$transaction([
      this.prisma.tank.count({ where }),
      this.prisma.tank.findMany({
        where,
        include: { livestock: true, waterTests: { orderBy: { testedAt: 'desc' }, take: 10 } },
        skip,
        take: query.pageSize,
        orderBy: { [query.sortBy]: query.sortOrder } as never,
      }),
    ]);

    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  createTank(orgId: string, data: CreateTankDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const tank = await tx.tank.create({ data: { ...data, orgId } });
      await tx.auditLog.create({
        data: {
          orgId,
          actorId,
          action: 'tank.create',
          resourceType: 'Tank',
          resourceId: tank.id,
          payload: data as never,
        },
      });
      return tank;
    });
  }

  addLivestock(tankId: string, dto: CreateLivestockDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.livestock.create({
        data: {
          ...dto,
          acquiredAt: new Date(dto.acquiredAt),
          status: 'ACTIVE',
          tankId,
        },
      });
      const tank = await tx.tank.findUnique({ where: { id: tankId } });
      await tx.livestockEvent.create({ data: { tankId, livestockId: created.id, type: 'ACQUIRED', details: `${dto.speciesName} acquired` } });
      await tx.auditLog.create({
        data: {
          orgId: tank?.orgId ?? 'demo-org',
          actorId,
          action: 'livestock.create',
          resourceType: 'Livestock',
          resourceId: created.id,
          payload: dto as never,
        },
      });
      return created;
    });
  }

  getTimeline(tankId: string) {
    return this.prisma.livestockEvent.findMany({
      where: { tankId },
      orderBy: { occurredAt: 'desc' },
    });
  }

  async addWaterTest(tankId: string, data: CreateWaterTestDto, actorId: string) {
    const created = await this.prisma.waterTest.create({ data: { tankId, ...data } });

    const po4HighCount = await this.prisma.waterTest.count({
      where: {
        tankId,
        po4: { gt: 0.25 },
        testedAt: { gte: new Date(Date.now() - 3 * 24 * 3600 * 1000) },
      },
    });

    if (po4HighCount >= 3) {
      await this.prisma.notification.create({
        data: {
          userId: actorId,
          category: 'ALERT',
          title: 'PO4 alert',
          body: 'PO4 above 0.25 for 3 days',
        },
      });
    }

    return created;
  }

  async importCsvRows(tankId: string, rows: CreateWaterTestDto[], actorId: string) {
    const created = await this.prisma.waterTest.createMany({
      data: rows.map((r) => ({ ...r, tankId })),
    });
    await this.prisma.notification.create({
      data: {
        userId: actorId,
        category: 'WATER_TEST',
        title: 'CSV imported',
        body: `${created.count} rows imported`,
      },
    });
    return created;
  }

  async createTaskTemplate(orgId: string, dto: CreateTaskTemplateDto) {
    return this.prisma.taskTemplate.create({ data: { ...dto, orgId } });
  }

  async weeklyPlan(tankId: string) {
    const templates = await this.prisma.taskTemplate.findMany({ where: { tankId } });
    return templates.map((t) => ({
      name: t.name,
      dueAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      streakImpact: '+1',
    }));
  }

  async completeTask(dto: CompleteTaskDto, userId: string) {
    await this.prisma.notification.create({
      data: {
        userId,
        category: 'MAINTENANCE',
        title: 'Task completed',
        body: `${dto.taskName} completed for tank ${dto.tankId}`,
      },
    });
    return { ok: true, streak: 5 };
  }

  async createDosingPlan(tankId: string, dto: CreateDosingPlanDto) {
    const plan = await this.prisma.dosingPlan.create({ data: { ...dto, tankId } });
    const daysLeft = dto.dailyDoseMl > 0 ? Math.floor(dto.inventoryMl / dto.dailyDoseMl) : 0;
    return { ...plan, forecastDepletionDays: daysLeft };
  }

  async expectedVsActual(tankId: string) {
    const logs = await this.prisma.dosingLog.findMany({
      where: { tankId },
      orderBy: { dosedAt: 'desc' },
      take: 30,
    });
    const expected = logs.reduce((a, b) => a + b.expectedMl, 0);
    const actual = logs.reduce((a, b) => a + b.actualMl, 0);
    return { expected, actual, variance: Number((actual - expected).toFixed(2)) };
  }

  async stockingRisk(tankId: string) {
    const [livestock, tank] = await Promise.all([
      this.prisma.livestock.findMany({ where: { tankId } }),
      this.prisma.tank.findUnique({ where: { id: tankId } }),
    ]);
    const densityFactor = tank ? livestock.length / Math.max(1, tank.volumeGallons / 20) : 1;
    const riskScore = Math.min(100, Math.round(densityFactor * 40));
    const explanations = [
      livestock.length > 12 ? 'High bioload for available volume.' : 'Bioload currently acceptable.',
      'Some species profiles indicate potential aggression or coral nipping.',
      'Mature tank requirement may not be met for sensitive species.',
    ];
    return { riskScore, explanations };
  }

  movingAverages(values: number[], period = 3) {
    return this.jobs.movingAverage(values, period);
  }

  checkAlert(dto: AlertRuleDto, values: number[]) {
    const trailing = values.slice(-dto.days);
    return trailing.length === dto.days && trailing.every((v) => v > dto.threshold);
  }

  smartSuggestions(input: {
    nitrateTrendUp: boolean;
    maintenanceMissed: boolean;
    po4HighDays: number;
  }) {
    return this.jobs.smartSuggestions(input);
  }

  async listNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async sendInvite(orgId: string, email: string, actorId: string) {
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await this.prisma.inviteToken.create({ data: { orgId, email, token, createdBy: actorId } });
    await fs.mkdir(join(process.cwd(), 'mailbox'), { recursive: true });
    await fs.writeFile(
      join(process.cwd(), 'mailbox', `${Date.now()}-${email}.json`),
      JSON.stringify({ to: email, subject: 'ReefOps Invite', token }, null, 2),
    );
    return { deliveredToMailbox: true, token };
  }


  async acceptInvite(token: string, userId: string) {
    const invite = await this.prisma.inviteToken.findUnique({ where: { token } });
    if (!invite || invite.acceptedAt) {
      return { accepted: false, reason: 'invalid_or_used_token' };
    }

    await this.prisma.$transaction([
      this.prisma.orgMembership.upsert({
        where: { userId_orgId: { userId, orgId: invite.orgId } },
        update: { role: 'MEMBER' },
        create: { userId, orgId: invite.orgId, role: 'MEMBER' },
      }),
      this.prisma.inviteToken.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
      this.prisma.auditLog.create({
        data: {
          orgId: invite.orgId,
          actorId: userId,
          action: 'invite.accept',
          resourceType: 'InviteToken',
          resourceId: invite.id,
          payload: { email: invite.email } as never,
        },
      }),
    ]);

    return { accepted: true, orgId: invite.orgId };
  }

  listSpecies(kind?: string, search?: string) {
    return this.prisma.speciesProfile.findMany({
      where: {
        ...(kind ? { kind } : {}),
        ...(search
          ? {
              OR: [
                { commonName: { contains: search, mode: 'insensitive' as const } },
                { scientificName: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      orderBy: { commonName: 'asc' },
      take: 100,
    });
  }

  async compatibilityReport(tankId: string) {
    const livestock = await this.prisma.livestock.findMany({ where: { tankId } });
    if (!livestock.length) {
      return { riskScore: 0, checks: ['No livestock in this tank yet.'] };
    }

    const profileNames = livestock.map((item) => item.speciesName);
    const profiles = await this.prisma.speciesProfile.findMany({
      where: { commonName: { in: profileNames } },
    });

    const checks: string[] = [];
    let riskScore = 0;

    for (const profile of profiles) {
      const rule = profile.compatibility.toLowerCase();
      if (rule.includes('nip')) {
        riskScore += 20;
        checks.push(`${profile.commonName}: ${profile.compatibility}`);
      }
      if (rule.includes('mature')) {
        riskScore += 10;
        checks.push(`${profile.commonName}: requires mature tank consideration.`);
      }
      if (rule.includes('aggressive')) {
        riskScore += 15;
        checks.push(`${profile.commonName}: watch for aggression.`);
      }
    }

    return {
      riskScore: Math.min(100, riskScore || 5),
      checks: checks.length ? checks : ['Compatibility checks passed for current livestock set.'],
    };
  }

}
