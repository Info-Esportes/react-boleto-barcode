export type BarcodePreset = 'light' | 'dark';

export const presets: Record<BarcodePreset, { foreground: string; background: string }> = {
  light: { foreground: '#000000', background: '#ffffff' },
  dark: { foreground: '#ffffff', background: '#000000' },
};
