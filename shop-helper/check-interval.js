export const DEFAULT_CHECK_INTERVAL_SECONDS = 60;
export const MIN_CHECK_INTERVAL_SECONDS = 30;
export const MAX_CHECK_INTERVAL_SECONDS = 60 * 60;

export function normalizeCheckIntervalSeconds(value) {
  const seconds = Number(value);
  return Number.isSafeInteger(seconds) &&
    seconds >= MIN_CHECK_INTERVAL_SECONDS &&
    seconds <= MAX_CHECK_INTERVAL_SECONDS
    ? seconds
    : DEFAULT_CHECK_INTERVAL_SECONDS;
}

export async function syncCheckAlarm(alarms, value, name = 'check-shop') {
  if (!alarms || typeof alarms.get !== 'function' || typeof alarms.create !== 'function') {
    throw new TypeError('A Chrome alarms API is required.');
  }
  const seconds = normalizeCheckIntervalSeconds(value);
  const periodInMinutes = seconds / 60;
  const existing = await alarms.get(name);
  if (!existing || !Number.isFinite(existing.periodInMinutes) ||
      Math.abs(existing.periodInMinutes - periodInMinutes) > 1e-9) {
    await alarms.create(name, { delayInMinutes: periodInMinutes, periodInMinutes });
  }
  return seconds;
}
