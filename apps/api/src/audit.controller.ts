import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListQueryDto } from './common.dto';
import { PrismaService } from './prisma.service';

@ApiTags('audit')
@Controller('v1/audit')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: ListQueryDto, @Query('orgId') orgId = 'demo-org') {
    const skip = (query.page - 1) * query.pageSize;
    const where = { orgId };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({ where, skip, take: query.pageSize, orderBy: { [query.sortBy]: query.sortOrder } as never }),
    ]);
    return { data, total, page: query.page, pageSize: query.pageSize };
  }
}
