/**
 * Normalize a loosely formatted time string into a 24-hour structure.
 *
 * Supported formats:
 *   - 24-hour clock: '15:00', '15:00:30', '15', '15:30:00'
 *   - 12-hour clock: '3pm', '3:00 PM', '3:00:00 pm', '12am', '12:30AM'
 *   - Optional whitespace around the input and between components
 *
 * The 12-hour interpretation is unambiguous for hour 1-11 and 12 with a
 * meridiem. For hour 0 in a 12-hour string (e.g. '0pm'), this parser rejects
 * it because '0' is not a valid 12-hour clock hour. This is a deliberate
 * choice: accepting it would silently guess a time that almost no one means.
 *
 * @param {string} input - Raw time string from a user or data source.
 * @returns {{hour: number, minute: number, second: number}}
 *   hour is 0-23, minute and second are 0-59.
 * @throws {TypeError} If input is not a string.
 * @throws {RangeError} If the string is not a recognized time or has out-of-range components.
 */
export function parseTime(input) {
  if (typeof input !== 'string') {
    throw new TypeError('parseTime expects a string');
  }

  const raw = input.trim();
  if (raw.length === 0) {
    throw new RangeError('time string is empty');
  }

  // Split the input into a time part and an optional meridiem suffix.
  // The meridiem must be separated from the digits by at least whitespace,
  // but not by a colon or other punctuation. This keeps '3:00PM' valid while
  // rejecting '3:00:PM' and similar.
  const match = raw.match(/^(.+?)\s*(am|pm)$/i);
  let timePart = raw;
  let meridiem = null;

  if (match) {
    timePart = match[1].trim();
    meridiem = match[2].toLowerCase();
  }

  if (timePart.length === 0) {
    throw new RangeError(`missing time before '${meridiem}'`);
  }

  // A time part may be one of:
  //   '3', '15', '3:00', '15:00', '3:00:00', '15:00:00'
  // We intentionally do NOT accept '3.00' or '3h00'. Those are separate
  // input dialects, and accepting them would make this parser silently
  // accept strings most callers consider invalid.
  const components = timePart.split(':');
  if (components.length > 3) {
    throw new RangeError(`too many colon-separated components in '${raw}'`);
  }

  if (components.some((part) => part.trim().length === 0)) {
    throw new RangeError(`empty component in time '${raw}'`);
  }

  const numbers = components.map((part) => {
    const text = part.trim();
    if (!/^\d+$/.test(text)) {
      throw new RangeError(`non-numeric time component '${text}' in '${raw}'`);
    }
    return Number(text);
  });

  let hour = numbers[0];
  const minute = numbers.length >= 2 ? numbers[1] : 0;
  const second = numbers.length >= 3 ? numbers[2] : 0;

  if (minute > 59) {
    throw new RangeError(`minute ${minute} out of range in '${raw}'`);
  }
  if (second > 59) {
    throw new RangeError(`second ${second} out of range in '${raw}'`);
  }

  if (meridiem === null) {
    // 24-hour interpretation.
    if (hour > 23) {
      throw new RangeError(`hour ${hour} out of range in '${raw}'`);
    }
  } else {
    // 12-hour interpretation. Only 1-12 are valid; 0 has no 12-hour meaning.
    if (hour < 1 || hour > 12) {
      throw new RangeError(`hour ${hour} out of range for 12-hour clock in '${raw}'`);
    }

    if (meridiem === 'am') {
      hour = hour === 12 ? 0 : hour;
    } else {
      hour = hour === 12 ? 12 : hour + 12;
    }
  }

  return { hour, minute, second };
}
