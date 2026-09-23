import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTime } from '../src/index.js';

test('parses 24-hour HH:MM:SS', () => {
  assert.deepEqual(parseTime('15:04:05'), { hour: 15, minute: 4, second: 5 });
});

test('parses 24-hour HH:MM', () => {
  assert.deepEqual(parseTime('15:04'), { hour: 15, minute: 4, second: 0 });
});

test('parses 24-hour bare hour', () => {
  assert.deepEqual(parseTime('15'), { hour: 15, minute: 0, second: 0 });
});

test('parses 12-hour with meridiem and no minutes', () => {
  assert.deepEqual(parseTime('3pm'), { hour: 15, minute: 0, second: 0 });
});

test('parses 12-hour with uppercase meridiem and space', () => {
  assert.deepEqual(parseTime('3:00 PM'), { hour: 15, minute: 0, second: 0 });
});

test('parses midnight as 12am', () => {
  assert.deepEqual(parseTime('12am'), { hour: 0, minute: 0, second: 0 });
});

test('parses noon as 12pm', () => {
  assert.deepEqual(parseTime('12pm'), { hour: 12, minute: 0, second: 0 });
});

test('parses 12-hour with seconds', () => {
  assert.deepEqual(parseTime('3:04:05pm'), { hour: 15, minute: 4, second: 5 });
});

test('trims surrounding whitespace', () => {
  assert.deepEqual(parseTime('  3:00 PM  '), { hour: 15, minute: 0, second: 0 });
});

test('rejects non-string input', () => {
  assert.throws(() => parseTime(3), TypeError);
});

test('rejects empty string', () => {
  assert.throws(() => parseTime(''), RangeError);
});

test('rejects hour out of range in 24-hour format', () => {
  assert.throws(() => parseTime('24:00'), RangeError);
});

test('rejects minute out of range', () => {
  assert.throws(() => parseTime('3:60pm'), RangeError);
});

test('rejects 0am as invalid 12-hour hour', () => {
  assert.throws(() => parseTime('0am'), RangeError);
});

test('rejects too many components', () => {
  assert.throws(() => parseTime('1:2:3:4'), RangeError);
});

test('rejects empty component', () => {
  assert.throws(() => parseTime('1::2'), RangeError);
});
