import { describe, expect, it } from 'vitest';
import { encodeInterleaved2of5 } from '../src/itf';

describe('encodeInterleaved2of5', () => {
  it('produces one bar per bar-element of the start pattern, digit pairs, and stop pattern', () => {
    // start (2 bars) + stop (2 bars) + 5 bars per digit-pair (one pair here: "12")
    const { bars } = encodeInterleaved2of5('12');

    expect(bars).toHaveLength(2 + 2 + 5);
  });

  it('pads an odd-length value with a leading zero', () => {
    const withPadding = encodeInterleaved2of5('1');
    const withoutPadding = encodeInterleaved2of5('01');

    expect(withPadding.bars).toEqual(withoutPadding.bars);
  });

  it('ignores non-digit characters', () => {
    const formatted = encodeInterleaved2of5('12.34 56');
    const stripped = encodeInterleaved2of5('123456');

    expect(formatted.bars).toEqual(stripped.bars);
  });

  it('scales bar widths with narrowWidth and wideRatio', () => {
    const base = encodeInterleaved2of5('12', { narrowWidth: 1, wideRatio: 2 });
    const scaled = encodeInterleaved2of5('12', { narrowWidth: 3, wideRatio: 2 });

    expect(scaled.totalWidth).toBe(base.totalWidth * 3);
  });

  it('throws when given an empty value', () => {
    expect(() => encodeInterleaved2of5('')).toThrow(/at least one digit/);
  });
});
