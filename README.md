# @info-esportes/react-boleto-barcode

A React component for rendering Interleaved 2 of 5 (ITF) barcodes as SVG, plus a helper for
converting a Brazilian bank boleto's linha digitável into the código de barras it actually
encodes.

## Install

```bash
npm install @info-esportes/react-boleto-barcode
```

## Usage

### Generic barcode

```tsx
import { Barcode } from '@info-esportes/react-boleto-barcode';

<Barcode value="12345678" />;
```

### Boleto barcode

Pass either the 47-digit linha digitável (what most payment APIs return) or the 44-digit
código de barras directly - both are accepted:

```tsx
import { BoletoBarcode } from '@info-esportes/react-boleto-barcode';

<BoletoBarcode value="23790.00124 60202.503219 30123.456706 1 12210000000100" />;
```

### Colors

Two built-in presets, or set colors explicitly:

```tsx
<BoletoBarcode preset="dark" value={linhaDigitavel} />
<BoletoBarcode background="#0a0a0a" foreground="#f5f5f5" value={linhaDigitavel} />
```

### Props

| Prop | Default | Description |
| --- | --- | --- |
| `value` | - | The number to encode. Non-digit characters are ignored. |
| `height` | `80` | SVG height. |
| `narrowWidth` | `2` | Width of a single narrow bar. |
| `wideRatio` | `2.5` | How many times wider a wide bar is than a narrow one. |
| `quietZone` | `10` | Blank margin on each side, as a multiple of `narrowWidth`. |
| `preset` | `'light'` | `'light'` or `'dark'`. Ignored if `foreground`/`background` are set. |
| `foreground` | - | Bar color. Overrides the preset. |
| `background` | - | Background color. Overrides the preset. |

`BoletoBarcode` also accepts `validateCheckDigits` (default `true`) to verify the linha
digitável's three field check digits before converting - set it to `false` to skip validation.

## Also exported

- `encodeInterleaved2of5(value, options)` - the underlying ITF encoder, returning bar
  positions/widths rather than markup, for custom rendering.
- `linhaDigitavelToBarcode(linhaDigitavel, options)` - the linha digitável → código de barras
  conversion on its own.

Only bank-issued boletos are supported (the format `BoletoBarcode`/`linhaDigitavelToBarcode`
expect). Arrecadação/convênio boletos (utility bills, taxes) use a different 48-digit layout.

## License

MIT
