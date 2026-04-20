import { describe, it, expect } from 'vitest';
import { 
  predictQueueWaitTime, 
  predictZoneDensity, 
  getFastestGate, 
  getFallbackRouteRecommendation 
} from '../utils.js';

describe('ArenaFlow pure prediction logic', () => {

  it('queue prediction logic - should return wait time bounded between 0 and 60', () => {
    // Check bounds
    expect(predictQueueWaitTime(60)).toBeLessThanOrEqual(60);
    expect(predictQueueWaitTime(0)).toBeGreaterThanOrEqual(0);

    // Test a normal range behavior
    const w = predictQueueWaitTime(30);
    expect(w).toBeGreaterThanOrEqual(25);
    expect(w).toBeLessThanOrEqual(35);
  });

  it('zone density prediction logic - should return density bounded between 0 and 100', () => {
    // Check bounds
    expect(predictZoneDensity(100)).toBeLessThanOrEqual(100);
    expect(predictZoneDensity(0)).toBeGreaterThanOrEqual(0);
    
    // Normal range
    const d = predictZoneDensity(50);
    expect(d).toBeGreaterThanOrEqual(40);
    expect(d).toBeLessThanOrEqual(60);
  });
});

describe('ArenaFlow easiest gate logic', () => {
  it('fastest gate selection - should return the gate queue with shortest wait time', () => {
    const queues = {
      q1: { id: 'q1', type: 'gate', waitTime: 10, name: 'Gate A' },
      q2: { id: 'q2', type: 'food', waitTime: 2, name: 'Food' }, // not a gate
      q3: { id: 'q3', type: 'gate', waitTime: 5, name: 'Gate B' }
    };
    
    const fastest = getFastestGate(queues);
    expect(fastest.id).toBe('q3');
    expect(fastest.name).toBe('Gate B');
  });

  it('fastest gate selection - returns null if no gates', () => {
    const fastest = getFastestGate({ food: { type: 'food', waitTime: 2 } });
    expect(fastest).toBeNull();
  });
});

describe('ArenaFlow route recommendation logic', () => {
  it('should recommend walking to an adjacent gate if density > 75', () => {
    const gateData = { density: 80 };
    const route = getFallbackRouteRecommendation('Gate B', 'Section 104', gateData);
    expect(route).toMatch(/walking over to the adjacent gate for faster entry/);
    expect(route).toMatch(/Gate B varies|quite busy right now/);
  });

  it('should recommend going straight to gate if density <= 75', () => {
    const gateData = { density: 50 };
    const route = getFallbackRouteRecommendation('Gate B', 'Section 104', gateData);
    expect(route).toMatch(/Head straight to Gate B/);
    expect(route).toMatch(/moving efficiently right now/);
  });

  it('should recommend going straight if no gate data provided', () => {
    const route = getFallbackRouteRecommendation('Gate B', 'Section 104', null);
    expect(route).toMatch(/Head straight to Gate B/);
  });
});
