import { describe, expect, it } from 'vitest';
import { linhaDigitavelToBarcode } from '../src/linhaDigitavelToBarcode';

describe('linhaDigitavelToBarcode', () => {
  it('converts a real, documented linha digitável into its known código de barras', () => {
    const linhaDigitavel = '23790.44809 56168.623793 36011.058009 7 40430000124020';

    expect(linhaDigitavelToBarcode(linhaDigitavel)).toBe('23797404300001240200448056168623793601105800');
  });

  it('accepts an already-stripped 47-digit string', () => {
    const linhaDigitavel = '23790448095616862379336011058009740430000124020';

    expect(linhaDigitavelToBarcode(linhaDigitavel)).toBe('23797404300001240200448056168623793601105800');
  });

  it('throws when the digit count is not 47', () => {
    expect(() => linhaDigitavelToBarcode('123')).toThrow(/47 digits/);
  });

  it('throws when a field check digit does not match', () => {
    const corrupted = '23790448005616862379336011058009740430000124020';

    expect(() => linhaDigitavelToBarcode(corrupted)).toThrow(/invalid check digit/);
  });

  it('skips check digit validation when disabled', () => {
    const corrupted = '23790448005616862379336011058009740430000124020';

    expect(() => linhaDigitavelToBarcode(corrupted, { validateCheckDigits: false })).not.toThrow();
  });
});
