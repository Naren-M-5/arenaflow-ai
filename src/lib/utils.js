// Pure functions for ArenaFlow logic extracted for testability

/**
 * Predicts the next wait time for a queue given current wait time.
 * @param {number} currentWaitTime - The current wait time.
 * @returns {number} The new wait time (bound 0 to 60).
 */
export function predictQueueWaitTime(currentWaitTime) {
  const timeShift = Math.floor(Math.random() * 11) - 5;
  let newWaitTime = (currentWaitTime || 5) + timeShift;
  return Math.max(0, Math.min(60, newWaitTime));
}

/**
 * Predicts the next density for a given zone.
 * @param {number} currentDensity - The current density percentage.
 * @returns {number} The new density (bound 0 to 100).
 */
export function predictZoneDensity(currentDensity) {
  const shift = Math.floor(Math.random() * 21) - 10;
  let newDensity = (currentDensity || 50) + shift;
  return Math.max(0, Math.min(100, newDensity));
}

/**
 * Derives the optimal/fastest gate from a queue list.
 * @param {Object} queues - Map of queues in the venue.
 * @returns {Object|null} The queue object with the shortest waitTime.
 */
export function getFastestGate(queues) {
  const gateQueues = Object.values(queues || {}).filter(q => q.type === 'gate');
  if (gateQueues.length === 0) return null;
  return gateQueues.sort((a,b) => a.waitTime - b.waitTime)[0];
}

/**
 * Returns a static route recommendation logic fallback.
 * @param {string} gate - The entry gate.
 * @param {string} section - The desired section.
 * @param {Object} gateData - Current capacity data of the selected gate.
 * @returns {string} Route recommendation message.
 */
export function getFallbackRouteRecommendation(gate, section, gateData) {
  if (gateData && gateData.density > 75) {
     return `It looks like ${gate} is quite busy right now (${gateData.density}% capacity). We suggest walking over to the adjacent gate for faster entry, then following the inner concourse directly to ${section}.`;
  }
  return `Head straight to ${gate}. It's moving efficiently right now. If you need step-free access, use the access ramps located at the far left of the main entrance. Proceed directly to ${section}.`;
}
