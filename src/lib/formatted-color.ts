import { RGBA } from '@/types';

import { hex2RGB } from './hex-2-rgb';
import { RGBToHex } from './rgb-to-hex';

export function formattedColor(color?: RGBA) {
  if (!color) return '';
  const hex = RGBToHex(color);

  if (color.a || color.a === 0) {
    const rgb = hex2RGB(hex);

    return `rgba(${rgb?.join(', ')}, ${color.a.toFixed(2)})`;
  }

  return `#${hex}`;
}
