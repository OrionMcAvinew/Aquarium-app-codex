import { Injectable } from '@nestjs/common';

@Injectable()
export class JobsService {
  movingAverage(values: number[], period = 3) {
    if (!values.length) return [] as number[];
    return values.map((_, i) => {
      const start = Math.max(0, i - period + 1);
      const slice = values.slice(start, i + 1);
      return Number((slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(3));
    });
  }

  smartSuggestions(input: {
    nitrateTrendUp: boolean;
    maintenanceMissed: boolean;
    po4HighDays: number;
  }) {
    const out: string[] = [];
    if (input.nitrateTrendUp && input.maintenanceMissed) {
      out.push('Schedule a 20% water change in the next 24h.');
    }
    if (input.po4HighDays >= 3) {
      out.push('Check media reactor and reduce feeding by 10%.');
    }
    if (!out.length) {
      out.push('System stable. Continue current maintenance cadence.');
    }
    return out;
  }

  forecastDepletion(inventoryMl: number, dailyDoseMl: number) {
    if (dailyDoseMl <= 0) return 0;
    return Math.floor(inventoryMl / dailyDoseMl);
  }
}
