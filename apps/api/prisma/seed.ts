import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('ChangeMe123!');
  const owner = await prisma.user.upsert({
    where: { email: 'owner@reefops.local' },
    update: { displayName: 'Demo Owner' },
    create: { email: 'owner@reefops.local', displayName: 'Demo Owner', passwordHash },
  });

  await prisma.notificationPreference.upsert({
    where: { userId: owner.id },
    update: {},
    create: { userId: owner.id, alertEmail: true, maintenanceEmail: true, telemetryEmail: true },
  });

  const org = await prisma.organization.upsert({
    where: { id: 'demo-org' },
    update: { name: 'ReefOps Demo Org' },
    create: { id: 'demo-org', name: 'ReefOps Demo Org' },
  });

  await prisma.orgMembership.upsert({
    where: { userId_orgId: { userId: owner.id, orgId: org.id } },
    update: { role: 'OWNER' },
    create: { userId: owner.id, orgId: org.id, role: 'OWNER' },
  });

  const tank = await prisma.tank.upsert({
    where: { id: 'demo-tank' },
    update: {},
    create: {
      id: 'demo-tank',
      orgId: org.id,
      name: 'Home Reef 300g',
      tankType: 'MIXED',
      volumeGallons: 300,
      dimensions: '96x30x24',
      equipmentList: 'heater, skimmer, ato, return pump, wavemakers, lights',
      saltType: 'Tropic Marin Pro',
      targetParams: { no3: 10, po4: 0.08, alk: 8.2, ca: 430, mg: 1360 },
    },
  });

  await prisma.taskTemplate.createMany({
    data: [
      { orgId: org.id, tankId: tank.id, name: 'Water change', cronRule: '0 10 * * 0' },
      { orgId: org.id, tankId: tank.id, name: 'Filter sock swap', cronRule: '0 9 * * 2,5' },
      { orgId: org.id, tankId: tank.id, name: 'Dose calibration', cronRule: '0 8 1 * *' },
    ],
    skipDuplicates: true,
  });

  const fish = Array.from({ length: 30 }).map((_, i) => ({
    commonName: `Reef Fish ${i + 1}`,
    scientificName: `Fishus ${i + 1}`,
    kind: 'FISH',
    careLevel: 'MEDIUM',
    compatibility: i % 4 ? 'Community' : 'May nip at LPS',
    checklist: 'Acclimate;observe aggression;feed varied diet',
  }));
  const coral = Array.from({ length: 20 }).map((_, i) => ({
    commonName: `Coral ${i + 1}`,
    scientificName: `Coralus ${i + 1}`,
    kind: 'CORAL',
    careLevel: 'MEDIUM',
    compatibility: 'Requires stable alk and nutrient control',
    checklist: 'Light acclimation;flow placement;parameter stability',
  }));
  const invert = Array.from({ length: 10 }).map((_, i) => ({
    commonName: `Invert ${i + 1}`,
    scientificName: `Invertus ${i + 1}`,
    kind: 'INVERT',
    careLevel: 'EASY',
    compatibility: 'Generally reef safe',
    checklist: 'Salinity match;slow acclimation',
  }));

  await prisma.speciesProfile.createMany({
    data: [...fish, ...coral, ...invert],
    skipDuplicates: true,
  });

  await prisma.livestock.create({
    data: {
      tankId: tank.id,
      speciesName: 'Reef Fish 1',
      kind: 'FISH',
      acquiredAt: new Date(),
      quarantineDays: 14,
      status: 'ACTIVE',
    },
  });

  await prisma.livestockEvent.createMany({
    data: [
      { tankId: tank.id, type: 'ACQUIRED', details: 'Reef Fish 1 added from quarantine.' },
      { tankId: tank.id, type: 'TRANSFER', details: 'Coral frag transferred to display.' },
    ],
  });

  await prisma.waterTest.createMany({
    data: [
      {
        tankId: tank.id,
        no3: 8,
        po4: 0.08,
        alk: 8.2,
        ca: 430,
        mg: 1360,
        ph: 8.1,
        salinity: 1.026,
        temperature: 78.2,
        ammonia: 0,
        nitrite: 0,
        note: 'Initial seed',
      },
      {
        tankId: tank.id,
        no3: 10,
        po4: 0.09,
        alk: 8,
        ca: 425,
        mg: 1350,
        ph: 8.05,
        salinity: 1.026,
        temperature: 78.5,
        ammonia: 0,
        nitrite: 0,
        note: 'Day 2',
      },
    ],
  });

  await prisma.dosingPlan.create({
    data: {
      tankId: tank.id,
      additiveName: '2-part Alk',
      concentration: 1,
      dailyDoseMl: 45,
      inventoryMl: 3000,
    },
  });

  await prisma.dosingLog.createMany({
    data: [
      { tankId: tank.id, expectedMl: 45, actualMl: 44 },
      { tankId: tank.id, expectedMl: 45, actualMl: 46 },
    ],
  });
}

main().finally(() => prisma.$disconnect());
