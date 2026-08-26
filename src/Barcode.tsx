import type { CSSProperties } from 'react';
import { encodeInterleaved2of5 } from './itf';
import { presets, type BarcodePreset } from './presets';

export interface BarcodeProps {
  /** The numeric value to encode. Non-digit characters (spaces, dots) are ignored. */
  value: string;
  height?: number;
  /** Width of a single narrow bar, in SVG user units. */
  narrowWidth?: number;
  /** How many times wider a wide bar is than a narrow one. Typical range is 2 to 3. */
  wideRatio?: number;
  /** Blank margin on each side, expressed as a multiple of narrowWidth. */
  quietZone?: number;
  /** Color preset applied when foreground/background aren't set explicitly. */
  preset?: BarcodePreset;
  foreground?: string;
  background?: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function Barcode({
  value,
  height = 80,
  narrowWidth = 2,
  wideRatio = 2.5,
  quietZone = 10,
  preset = 'light',
  foreground,
  background,
  className,
  style,
  'aria-label': ariaLabel,
}: BarcodeProps) {
  const { bars, totalWidth } = encodeInterleaved2of5(value, { narrowWidth, wideRatio });
  const quietZoneWidth = quietZone * narrowWidth;
  const width = totalWidth + quietZoneWidth * 2;

  const fg = foreground ?? presets[preset].foreground;
  const bg = background ?? presets[preset].background;

  return (
    <svg
      aria-label={ariaLabel ?? `Barcode ${value}`}
      className={className}
      height={height}
      role="img"
      style={style}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill={bg} height={height} width={width} x={0} y={0} />
      {bars.map((bar) => (
        <rect key={bar.start} fill={fg} height={height} width={bar.width} x={bar.start + quietZoneWidth} y={0} />
      ))}
    </svg>
  );
}
