import * as react0 from "react";
import * as react1 from "react";
import { CSSProperties } from "react";

//#region src/presets.d.ts
type BarcodePreset = 'light' | 'dark';
declare const presets: Record<BarcodePreset, {
  foreground: string;
  background: string;
}>;

//#endregion
//#region src/Barcode.d.ts
interface BarcodeProps {
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
declare function Barcode({
  value,
  height,
  narrowWidth,
  wideRatio,
  quietZone,
  preset,
  foreground,
  background,
  className,
  style,
  'aria-label': ariaLabel
}: BarcodeProps): react0.JSX.Element;

//#endregion
//#region src/BoletoBarcode.d.ts
interface BoletoBarcodeProps extends Omit<BarcodeProps, 'value'> {
  /** Either the 47-digit linha digitável or the 44-digit código de barras, formatted or not. */
  value: string;
  /** Verify each linha digitável field's check digit before converting. Defaults to true. */
  validateCheckDigits?: boolean;
}
/**
 * Renders a boleto's barcode from whichever number you already have on hand - the 47-digit
 * linha digitável (what most payment APIs return) is converted automatically; a 44-digit
 * código de barras is rendered as-is.
 */
declare function BoletoBarcode({
  value,
  validateCheckDigits,
  ...rest
}: BoletoBarcodeProps): react1.JSX.Element;

//#endregion
//#region src/itf.d.ts
interface BarcodeBar {
  start: number;
  width: number;
}
interface ItfEncodeResult {
  bars: BarcodeBar[];
  totalWidth: number;
}
interface ItfEncodeOptions {
  /** Width of a single narrow module, in the same unit the caller renders with. */
  narrowWidth?: number;
  /** How many times wider a "wide" element is than a narrow one. Typical range is 2 to 3. */
  wideRatio?: number;
}
/**
 * Encodes a numeric string as Interleaved 2 of 5 (ITF), returning bar positions and widths
 * rather than markup, so it can be rendered by any consumer (SVG, canvas, etc).
 *
 * ITF encodes digits in pairs, one in the bars and the next in the interleaved spaces, so it
 * requires an even digit count - an odd-length value is padded with a leading zero.
 */
declare function encodeInterleaved2of5(value: string, options?: ItfEncodeOptions): ItfEncodeResult;

//#endregion
//#region src/linhaDigitavelToBarcode.d.ts
interface LinhaDigitavelToBarcodeOptions {
  /** Verify each field's mod10 check digit before converting. Defaults to true. */
  validateCheckDigits?: boolean;
}
/**
 * Converts a bank-issued boleto's 47-digit linha digitável into its 44-digit código de barras -
 * the number Interleaved 2 of 5 barcodes actually encode. Not valid for arrecadação/convênio
 * boletos (utility bills, taxes), which use a different 48-digit format entirely.
 *
 * Field layout (Febraban standard), all indices into the 47 stripped digits:
 * - campo1 (0-9): banco+moeda (0-3) + campo livre chars 1-5 (4-8) + check digit (9)
 * - campo2 (10-20): campo livre chars 6-15 (10-19) + check digit (20)
 * - campo3 (21-31): campo livre chars 16-25 (21-30) + check digit (31)
 * - campo4 (32): DV geral of the barcode, copied through unchanged
 * - campo5 (33-46): fator de vencimento + valor, copied through unchanged
 */
declare function linhaDigitavelToBarcode(linhaDigitavel: string, options?: LinhaDigitavelToBarcodeOptions): string;

//#endregion
export { Barcode, BarcodeBar, BarcodePreset, BarcodeProps, BoletoBarcode, BoletoBarcodeProps, ItfEncodeOptions, ItfEncodeResult, LinhaDigitavelToBarcodeOptions, encodeInterleaved2of5, linhaDigitavelToBarcode, presets };