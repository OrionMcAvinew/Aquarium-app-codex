import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditController } from './audit.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JobsService } from './jobs.service';
import { NotificationsController } from './notifications.controller';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { PrismaService } from './prisma.service';
import { ReefController } from './reef.controller';
import { ReefService } from './reef.service';
import { RolesGuard } from './rbac';
import { TelemetryGateway } from './telemetry.gateway';
import { UploadsController } from './uploads.controller';
import { TelemetryProcessor } from './telemetry.processor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    JwtModule.register({}),
    BullModule.forRoot({ connection: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' } }),
    BullModule.registerQueue({ name: 'telemetry' }),
  ],
  controllers: [
    AppController,
    ReefController,
    AuthController,
    OrgController,
    AuditController,
    NotificationsController,
    UploadsController,
  ],
  providers: [
    AppService,
    PrismaService,
    ReefService,
    AuthService,
    JobsService,
    OrgService,
    TelemetryGateway,
    Reflector,
    RolesGuard,
    TelemetryProcessor,
  ],
})
export class AppModule {}
