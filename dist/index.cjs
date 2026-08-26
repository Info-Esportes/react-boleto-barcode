"use strict";
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
const react_jsx_runtime = __toESM(require("react/jsx-runtime"));

//#region src/itf.ts
const DIGIT_PATTERNS = {
	"0": "nnWWn",
	"1": "WnnnW",
	"2": "nWnnW",
	"3": "WWnnn",
	"4": "nnWnW",
	"5": "WnWnn",
	"6": "nWWnn",
	"7": "nnnWW",
	"8": "WnnWn",
	"9": "nWnWn"
};
const START_PATTERN = "nnnn";
const STOP_PATTERN = "Wnn";
/**
* Encodes a numeric string as Interleaved 2 of 5 (ITF), returning bar positions and widths
* rather than markup, so it can be rendered by any consumer (SVG, canvas, etc).
*
* ITF encodes digits in pairs, one in the bars and the next in the interleaved spaces, so it
* requires an even digit count - an odd-length value is padded with a leading zero.
*/
function encodeInterleaved2of5(value, options = {}) {
	const digits = value.replace(/\D/g, "");
	if (digits.length === 0) throw new Error("react-boleto-barcode: value must contain at least one digit.");
	const padded = digits.length % 2 === 0 ? digits : `0${digits}`;
	const narrowWidth = options.narrowWidth ?? 1;
	const wideWidth = narrowWidth * (options.wideRatio ?? 2.5);
	const widthFor = (w) => w === "n" ? narrowWidth : wideWidth;
	const elementWidths = [];
	for (const w of START_PATTERN) elementWidths.push(widthFor(w));
	for (let i = 0; i < padded.length; i += 2) {
		const barPattern = DIGIT_PATTERNS[padded[i]];
		const spacePattern = DIGIT_PATTERNS[padded[i + 1]];
		for (let j = 0; j < 5; j++) {
			elementWidths.push(widthFor(barPattern[j]));
			elementWidths.push(widthFor(spacePattern[j]));
		}
	}
	for (const w of STOP_PATTERN) elementWidths.push(widthFor(w));
	const bars = [];
	let cursor = 0;
	elementWidths.forEach((width, index) => {
		if (index % 2 === 0) bars.push({
			start: cursor,
			width
		});
		cursor += width;
	});
	return {
		bars,
		totalWidth: cursor
	};
}

//#endregion
//#region src/presets.ts
const presets = {
	light: {
		foreground: "#000000",
		background: "#ffffff"
	},
	dark: {
		foreground: "#ffffff",
		background: "#000000"
	}
};

//#endregion
//#region src/Barcode.tsx
function Barcode({ value, height = 80, narrowWidth = 2, wideRatio = 2.5, quietZone = 10, preset = "light", foreground, background, className, style, "aria-label": ariaLabel }) {
	const { bars, totalWidth } = encodeInterleaved2of5(value, {
		narrowWidth,
		wideRatio
	});
	const quietZoneWidth = quietZone * narrowWidth;
	const width = totalWidth + quietZoneWidth * 2;
	const fg = foreground ?? presets[preset].foreground;
	const bg = background ?? presets[preset].background;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
		"aria-label": ariaLabel ?? `Barcode ${value}`,
		className,
		height,
		role: "img",
		style,
		viewBox: `0 0 ${width} ${height}`,
		width,
		xmlns: "http://www.w3.org/2000/svg",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			fill: bg,
			height,
			width,
			x: 0,
			y: 0
		}), bars.map((bar) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			fill: fg,
			height,
			width: bar.width,
			x: bar.start + quietZoneWidth,
			y: 0
		}, bar.start))]
	});
}

//#endregion
//#region src/linhaDigitavelToBarcode.ts
/**
* Modulo 10 check digit used by the first three fields of a boleto's linha digitável: digits
* are weighted 2, 1, 2, 1... from right to left, and a weighted product greater than 9 has its
* own digits summed (equivalent to subtracting 9).
*/
function mod10CheckDigit(data) {
	let sum = 0;
	for (let i = 0; i < data.length; i++) {
		const distanceFromRight = data.length - 1 - i;
		const weight = distanceFromRight % 2 === 0 ? 2 : 1;
		const product = Number(data[i]) * weight;
		sum += product > 9 ? product - 9 : product;
	}
	return (10 - sum % 10) % 10;
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
function linhaDigitavelToBarcode(linhaDigitavel, options = {}) {
	const digits = linhaDigitavel.replace(/\D/g, "");
	if (digits.length !== 47) throw new Error(`react-boleto-barcode: a bank boleto's linha digitável must have 47 digits, got ${digits.length}.`);
	const campo1 = digits.slice(0, 10);
	const campo2 = digits.slice(10, 21);
	const campo3 = digits.slice(21, 32);
	const dvGeral = digits[32];
	const campo5 = digits.slice(33, 47);
	if (options.validateCheckDigits ?? true) {
		const fields = [
			[
				campo1.slice(0, 9),
				campo1[9],
				"campo 1"
			],
			[
				campo2.slice(0, 10),
				campo2[10],
				"campo 2"
			],
			[
				campo3.slice(0, 10),
				campo3[10],
				"campo 3"
			]
		];
		for (const [data, dv, label] of fields) {
			const expected = mod10CheckDigit(data);
			if (String(expected) !== dv) throw new Error(`react-boleto-barcode: invalid check digit for ${label} (expected ${expected}, got ${dv}). The linha digitável may be mistyped.`);
		}
	}
	const bancoMoeda = campo1.slice(0, 4);
	const campoLivrePart1 = campo1.slice(4, 9);
	const campoLivrePart2 = campo2.slice(0, 10);
	const campoLivrePart3 = campo3.slice(0, 10);
	return bancoMoeda + dvGeral + campo5 + campoLivrePart1 + campoLivrePart2 + campoLivrePart3;
}

//#endregion
//#region src/BoletoBarcode.tsx
/**
* Renders a boleto's barcode from whichever number you already have on hand - the 47-digit
* linha digitável (what most payment APIs return) is converted automatically; a 44-digit
* código de barras is rendered as-is.
*/
function BoletoBarcode({ value, validateCheckDigits,...rest }) {
	const digits = value.replace(/\D/g, "");
	const barcode = digits.length === 47 ? linhaDigitavelToBarcode(digits, { validateCheckDigits }) : digits;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Barcode, {
		...rest,
		value: barcode
	});
}

//#endregion
exports.Barcode = Barcode
exports.BoletoBarcode = BoletoBarcode
exports.encodeInterleaved2of5 = encodeInterleaved2of5
exports.linhaDigitavelToBarcode = linhaDigitavelToBarcode
exports.presets = presets