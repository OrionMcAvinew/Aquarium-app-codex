import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AddMemberDto, CreateOrgDto } from './org.dto';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  createOrg(dto: CreateOrgDto, ownerId: string) {
    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({ data: { name: dto.name } });
      await tx.orgMembership.create({ data: { orgId: org.id, userId: ownerId, role: 'OWNER' } });
      return org;
    });
  }

  listOrgs(userId: string) {
    return this.prisma.orgMembership.findMany({ where: { userId }, include: { org: true } });
  }

  addMember(orgId: string, dto: AddMemberDto) {
    return this.prisma.orgMembership.upsert({
      where: { userId_orgId: { userId: dto.userId, orgId } },
      update: { role: dto.role },
      create: { orgId, userId: dto.userId, role: dto.role },
    });
  }
}
