import { Color } from 'figma-js';

export function RGBToHex(color: Color) {
  let r = Math.floor(color.r * 255).toString(16);
  let g = Math.floor(color.g * 255).toString(16);
  let b = Math.floor(color.b * 255).toString(16);

  if (r.length === 1) r = '0' + r;
  if (g.length === 1) g = '0' + g;
  if (b.length === 1) b = '0' + b;

  return r + g + b;
}
