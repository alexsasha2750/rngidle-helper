import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CHECK_INTERVAL_SECONDS, MAX_CHECK_INTERVAL_SECONDS, MIN_CHECK_INTERVAL_SECONDS,
  normalizeCheckIntervalSeconds, syncCheckAlarm,
} from '../check-interval.js';

test('check intervals are bounded and default safely', () => {
  assert.equal(normalizeCheckIntervalSeconds(undefined), DEFAULT_CHECK_INTERVAL_SECONDS);
  assert.equal(normalizeCheckIntervalSeconds(29), DEFAULT_CHECK_INTERVAL_SECONDS);
  assert.equal(normalizeCheckIntervalSeconds(30), MIN_CHECK_INTERVAL_SECONDS);
  assert.equal(normalizeCheckIntervalSeconds(90), 90);
  assert.equal(normalizeCheckIntervalSeconds(3600), MAX_CHECK_INTERVAL_SECONDS);
  assert.equal(normalizeCheckIntervalSeconds(3601), DEFAULT_CHECK_INTERVAL_SECONDS);
  assert.equal(normalizeCheckIntervalSeconds(1.5), DEFAULT_CHECK_INTERVAL_SECONDS);
});

test('the shop alarm is created at the configured interval', async () => {
  let current;
  const calls = [];
  const alarms = {
    get: async name => { assert.equal(name, 'check-shop'); return current; },
    create: async (name, info) => { calls.push({ name, info }); current = { periodInMinutes: info.periodInMinutes }; },
  };
  await syncCheckAlarm(alarms, 30);
  assert.deepEqual(calls[0], { name: 'check-shop', info: { delayInMinutes: 0.5, periodInMinutes: 0.5 } });
  await syncCheckAlarm(alarms, 30);
  assert.equal(calls.length, 1, 'an unchanged interval does not reset the alarm');
  await syncCheckAlarm(alarms, 120);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].info.periodInMinutes, 2);
});
