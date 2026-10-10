# Time Parser Ambiguity Resolver

Parses loosely formatted time strings such as `3pm`, `15:00`, and `3:00 PM` into a normalized 24-hour structure with validation.

```js
import { parseTime } from 'time-parser-ambiguity-resolver';

parseTime('3pm');        // { hour: 15, minute: 0, second: 0 }
parseTime('15:04:05');   // { hour: 15, minute: 4, second: 5 }
parseTime('12am');       // { hour: 0, minute: 0, second: 0 }
```

The library exists because time strings in the wild are inconsistent: users mix 12-hour and 24-hour clocks, omit leading zeros, and vary capitalization and spacing. A parser that accepts all of these without guessing is surprisingly fiddly. The trade-off made here is strictness: the parser accepts only unambiguous numeric components separated by colons, with an optional `am`/`pm` suffix. It rejects zero hours in 12-hour strings (`0am`, `0pm`) rather than guessing what the author meant.

The awkward edge a reader will hit is `12am` and `12pm`: these are interpreted as midnight and noon respectively, following the common convention. Any other hour with a meridiem is converted to 24-hour time. Strings without a meridiem are always interpreted as 24-hour time.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

## Limitations

Values are coerced to floats, so very large integers lose precision. If you need
exact integer aggregates over a window, this is the wrong tool.

