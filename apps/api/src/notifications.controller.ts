import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma.service';

@ApiTags('notifications')
@Controller('v1/notifications')
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('preferences')
  getPreferences(@Query('userId') userId = 'demo-user') {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  @Post('preferences')
  setPreferences(
    @Query('userId') userId = 'demo-user',
    @Body() body: { maintenanceEmail?: boolean; alertEmail?: boolean; telemetryEmail?: boolean },
  ) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: body,
      create: { userId, ...body },
    });
  }
}
