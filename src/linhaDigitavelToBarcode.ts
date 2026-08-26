export interface LinhaDigitavelToBarcodeOptions {
  /** Verify each field's mod10 check digit before converting. Defaults to true. */
  validateCheckDigits?: boolean;
}

/**
 * Modulo 10 check digit used by the first three fields of a boleto's linha digitável: digits
 * are weighted 2, 1, 2, 1... from right to left, and a weighted product greater than 9 has its
 * own digits summed (equivalent to subtracting 9).
 */
function mod10CheckDigit(data: string): number {
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    const distanceFromRight = data.length - 1 - i;
    const weight = distanceFromRight % 2 === 0 ? 2 : 1;
    const product = Number(data[i]) * weight;

    sum += product > 9 ? product - 9 : product;
  }

  return (10 - (sum % 10)) % 10;
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
export function linhaDigitavelToBarcode(linhaDigitavel: string, options: LinhaDigitavelToBarcodeOptions = {}): string {
  const digits = linhaDigitavel.replace(/\D/g, '');

  if (digits.length !== 47) {
    throw new Error(
      `react-boleto-barcode: a bank boleto's linha digitável must have 47 digits, got ${digits.length}.`,
    );
  }

  const campo1 = digits.slice(0, 10);
  const campo2 = digits.slice(10, 21);
  const campo3 = digits.slice(21, 32);
  const dvGeral = digits[32];
  const campo5 = digits.slice(33, 47);

  if (options.validateCheckDigits ?? true) {
    const fields: Array<[data: string, dv: string, label: string]> = [
      [campo1.slice(0, 9), campo1[9], 'campo 1'],
      [campo2.slice(0, 10), campo2[10], 'campo 2'],
      [campo3.slice(0, 10), campo3[10], 'campo 3'],
    ];

    for (const [data, dv, label] of fields) {
      const expected = mod10CheckDigit(data);

      if (String(expected) !== dv) {
        throw new Error(
          `react-boleto-barcode: invalid check digit for ${label} (expected ${expected}, got ${dv}). ` +
            'The linha digitável may be mistyped.',
        );
      }
    }
  }

  const bancoMoeda = campo1.slice(0, 4);
  const campoLivrePart1 = campo1.slice(4, 9);
  const campoLivrePart2 = campo2.slice(0, 10);
  const campoLivrePart3 = campo3.slice(0, 10);

  return bancoMoeda + dvGeral + campo5 + campoLivrePart1 + campoLivrePart2 + campoLivrePart3;
}
