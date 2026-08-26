import { Barcode, type BarcodeProps } from './Barcode';
import { linhaDigitavelToBarcode } from './linhaDigitavelToBarcode';

export interface BoletoBarcodeProps extends Omit<BarcodeProps, 'value'> {
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
export function BoletoBarcode({ value, validateCheckDigits, ...rest }: BoletoBarcodeProps) {
  const digits = value.replace(/\D/g, '');
  const barcode = digits.length === 47 ? linhaDigitavelToBarcode(digits, { validateCheckDigits }) : digits;

  return <Barcode {...rest} value={barcode} />;
}
