import { Color } from 'figma-js';

import { hex2RGB } from '../hex-2-rgb/hex-2-rgb';
import { RGBToHex } from '../rgb-to-hex/rgb-to-hex';

export function formattedColor(color: Color, opacity?: number) {
  const hex = RGBToHex(color);

  if (opacity || opacity === 0) {
    const rgb = hex2RGB(hex);

    return `rgba(${rgb?.join(', ')}, ${opacity.toFixed(2)})`;
  }
  return `#${hex}`;
}
