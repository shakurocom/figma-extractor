import { RGB_HEX_REGEX } from '../constants';

export const hex2RGB = (str: string) => {
  const [, short, long] = String(str).match(RGB_HEX_REGEX) || [];

  if (long) {
    const value = Number.parseInt(long, 16);
    return [value >> 16, (value >> 8) & 0xff, value & 0xff];
  } else if (short) {
    return Array.from(short, s => Number.parseInt(s, 16)).map(n => (n << 4) | n);
  }
};
