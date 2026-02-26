import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListQueryDto } from './common.dto';
import {
  AlertRuleDto,
  CompleteTaskDto,
  CreateDosingPlanDto,
  CreateLivestockDto,
  CreateTankDto,
  CreateTaskTemplateDto,
  CreateWaterTestDto,
  CsvImportDto,
  SuggestionInputDto,
  SendInviteDto,
  AcceptInviteDto,
} from './reef.dto';
import { ReefService } from './reef.service';
import { Roles, RolesGuard } from './rbac';

@ApiTags('reef')
@UseGuards(RolesGuard)
@Controller('v1')
export class ReefController {
  constructor(private readonly reefService: ReefService) {}

  @Get('tanks')
  listTanks(@Query('orgId') orgId = 'demo-org', @Query() query: ListQueryDto) {
    return this.reefService.listTanks(orgId, query);
  }

  @Post('tanks')
  @Roles('OWNER', 'ADMIN')
  createTank(@Query('orgId') orgId = 'demo-org', @Body() body: CreateTankDto) {
    return this.reefService.createTank(orgId, body, 'demo-user');
  }

  @Post('tanks/:tankId/livestock')
  @Roles('OWNER', 'ADMIN')
  addLivestock(@Param('tankId') tankId: string, @Body() body: CreateLivestockDto) {
    return this.reefService.addLivestock(tankId, body, 'demo-user');
  }

  @Get('tanks/:tankId/timeline')
  timeline(@Param('tankId') tankId: string) {
    return this.reefService.getTimeline(tankId);
  }

  @Post('tanks/:tankId/water-tests')
  addWaterTest(@Param('tankId') tankId: string, @Body() body: CreateWaterTestDto) {
    return this.reefService.addWaterTest(tankId, body, 'demo-user');
  }

  @Post('tanks/:tankId/water-tests/import')
  importWaterCsv(@Param('tankId') tankId: string, @Body() body: CsvImportDto) {
    return this.reefService.importCsvRows(tankId, body.rows, 'demo-user');
  }

  @Post('task-templates')
  createTaskTemplate(@Query('orgId') orgId = 'demo-org', @Body() body: CreateTaskTemplateDto) {
    return this.reefService.createTaskTemplate(orgId, body);
  }

  @Get('tanks/:tankId/weekly-plan')
  weeklyPlan(@Param('tankId') tankId: string) {
    return this.reefService.weeklyPlan(tankId);
  }

  @Post('tasks/complete')
  completeTask(@Body() body: CompleteTaskDto) {
    return this.reefService.completeTask(body, 'demo-user');
  }

  @Post('tanks/:tankId/dosing-plans')
  createDosing(@Param('tankId') tankId: string, @Body() body: CreateDosingPlanDto) {
    return this.reefService.createDosingPlan(tankId, body);
  }

  @Get('tanks/:tankId/dosing-summary')
  dosingSummary(@Param('tankId') tankId: string) {
    return this.reefService.expectedVsActual(tankId);
  }

  @Get('tanks/:tankId/stocking-risk')
  stockingRisk(@Param('tankId') tankId: string) {
    return this.reefService.stockingRisk(tankId);
  }

  @Post('alerts/evaluate')
  evaluateAlert(@Body() body: { rule: AlertRuleDto; values: number[] }) {
    return { triggered: this.reefService.checkAlert(body.rule, body.values) };
  }

  @Post('suggestions')
  suggestions(@Body() body: SuggestionInputDto) {
    return { suggestions: this.reefService.smartSuggestions(body) };
  }

  @Get('notifications')
  notifications(@Query('userId') userId = 'demo-user') {
    return this.reefService.listNotifications(userId);
  }

  @Post('orgs/:orgId/invites')
  invite(@Param('orgId') orgId: string, @Body() body: SendInviteDto) {
    return this.reefService.sendInvite(orgId, body.email, 'demo-user');
  }

  @Post('invites/accept')
  acceptInvite(@Body() body: AcceptInviteDto) {
    return this.reefService.acceptInvite(body.token, body.userId);
  }

  @Get('species')
  species(@Query('kind') kind?: string, @Query('search') search?: string) {
    return this.reefService.listSpecies(kind, search);
  }

  @Get('tanks/:tankId/compatibility-report')
  compatibilityReport(@Param('tankId') tankId: string) {
    return this.reefService.compatibilityReport(tankId);
  }
}
