export interface BarcodeBar {
  start: number;
  width: number;
}

export interface ItfEncodeResult {
  bars: BarcodeBar[];
  totalWidth: number;
}

export interface ItfEncodeOptions {
  /** Width of a single narrow module, in the same unit the caller renders with. */
  narrowWidth?: number;
  /** How many times wider a "wide" element is than a narrow one. Typical range is 2 to 3. */
  wideRatio?: number;
}

type Width = 'n' | 'W';

// Each digit's 5-element bar/space pattern (n = narrow, W = wide), per the ITF spec.
const DIGIT_PATTERNS: Record<string, string> = {
  '0': 'nnWWn',
  '1': 'WnnnW',
  '2': 'nWnnW',
  '3': 'WWnnn',
  '4': 'nnWnW',
  '5': 'WnWnn',
  '6': 'nWWnn',
  '7': 'nnnWW',
  '8': 'WnnWn',
  '9': 'nWnWn',
};

const START_PATTERN = 'nnnn';
const STOP_PATTERN = 'Wnn';

/**
 * Encodes a numeric string as Interleaved 2 of 5 (ITF), returning bar positions and widths
 * rather than markup, so it can be rendered by any consumer (SVG, canvas, etc).
 *
 * ITF encodes digits in pairs, one in the bars and the next in the interleaved spaces, so it
 * requires an even digit count - an odd-length value is padded with a leading zero.
 */
export function encodeInterleaved2of5(value: string, options: ItfEncodeOptions = {}): ItfEncodeResult {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) {
    throw new Error('react-boleto-barcode: value must contain at least one digit.');
  }

  const padded = digits.length % 2 === 0 ? digits : `0${digits}`;

  const narrowWidth = options.narrowWidth ?? 1;
  const wideWidth = narrowWidth * (options.wideRatio ?? 2.5);
  const widthFor = (w: Width) => (w === 'n' ? narrowWidth : wideWidth);

  const elementWidths: number[] = [];

  for (const w of START_PATTERN) {
    elementWidths.push(widthFor(w as Width));
  }

  for (let i = 0; i < padded.length; i += 2) {
    const barPattern = DIGIT_PATTERNS[padded[i]];
    const spacePattern = DIGIT_PATTERNS[padded[i + 1]];

    for (let j = 0; j < 5; j++) {
      elementWidths.push(widthFor(barPattern[j] as Width));
      elementWidths.push(widthFor(spacePattern[j] as Width));
    }
  }

  for (const w of STOP_PATTERN) {
    elementWidths.push(widthFor(w as Width));
  }

  const bars: BarcodeBar[] = [];
  let cursor = 0;

  elementWidths.forEach((width, index) => {
    // Elements alternate bar, space, bar, space... starting with a bar.
    if (index % 2 === 0) {
      bars.push({ start: cursor, width });
    }
    cursor += width;
  });

  return { bars, totalWidth: cursor };
}
