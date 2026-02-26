import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from './rbac';
import { AddMemberDto, CreateOrgDto } from './org.dto';
import { OrgService } from './org.service';

@ApiTags('organizations')
@UseGuards(RolesGuard)
@Controller('v1/orgs')
export class OrgController {
  constructor(private readonly orgs: OrgService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@Body() dto: CreateOrgDto, @Query('ownerId') ownerId = 'demo-user') {
    return this.orgs.createOrg(dto, ownerId);
  }

  @Get()
  list(@Query('userId') userId = 'demo-user') {
    return this.orgs.listOrgs(userId);
  }

  @Post(':orgId/members')
  @Roles('OWNER', 'ADMIN')
  addMember(@Param('orgId') orgId: string, @Body() dto: AddMemberDto) {
    return this.orgs.addMember(orgId, dto);
  }
}
