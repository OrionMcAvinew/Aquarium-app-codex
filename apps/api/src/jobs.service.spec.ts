import { JobsService } from './jobs.service';

describe('JobsService', () => {
  const service = new JobsService();

  it('calculates moving averages', () => {
    expect(service.movingAverage([1, 2, 3, 4], 2)).toEqual([1, 1.5, 2.5, 3.5]);
  });

  it('generates deterministic smart suggestions', () => {
    const suggestions = service.smartSuggestions({
      nitrateTrendUp: true,
      maintenanceMissed: true,
      po4HighDays: 3,
    });
    expect(suggestions.length).toBeGreaterThan(1);
  });

  it('forecasts additive depletion', () => {
    expect(service.forecastDepletion(1000, 40)).toBe(25);
  });
});
