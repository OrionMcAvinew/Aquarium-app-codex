import { InjectQueue, OnModuleInit } from '@nestjs/bullmq';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Job, Queue, Worker } from 'bullmq';
import { PrismaService } from './prisma.service';
import { TelemetryGateway } from './telemetry.gateway';

@Injectable()
export class TelemetryProcessor implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker;

  constructor(
    @InjectQueue('telemetry') private readonly telemetryQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly gateway: TelemetryGateway,
  ) {}

  async onModuleInit() {
    const exists = await this.telemetryQueue.getRepeatableJobs();
    const hasTick = exists.some((job) => job.name === 'telemetry.tick');
    if (!hasTick) {
      await this.telemetryQueue.add('telemetry.tick', {}, { repeat: { every: 4000 }, jobId: 'telemetry-repeat' });
    }

    this.worker = new Worker(
      'telemetry',
      async (job) => this.process(job),
      { connection: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' } },
    );
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  async process(_job: Job) {
    const payload = {
      tankId: 'demo-tank',
      equipment: 'heater',
      temperature: Number((76 + Math.random() * 3).toFixed(2)),
      powerDraw: Number((90 + Math.random() * 20).toFixed(1)),
      state: Math.random() > 0.1 ? 'OK' : 'ALERT',
      ts: new Date().toISOString(),
    };

    await this.prisma.equipmentTelemetry.create({
      data: {
        tankId: payload.tankId,
        equipment: payload.equipment,
        temperature: payload.temperature,
        powerDraw: payload.powerDraw,
        state: payload.state,
      },
    });

    this.gateway.server?.emit('telemetry', payload);

    if (payload.temperature > 80.5 || payload.temperature < 75) {
      const alert = {
        tankId: payload.tankId,
        severity: 'high',
        message: 'Heater may be stuck on/off based on telemetry profile.',
        ts: payload.ts,
      };
      this.gateway.server?.emit('telemetry-alert', alert);
      await this.prisma.notification.create({
        data: {
          userId: 'demo-user',
          category: 'TELEMETRY',
          title: 'Telemetry heater alert',
          body: alert.message,
        },
      });
    }
  }
}
